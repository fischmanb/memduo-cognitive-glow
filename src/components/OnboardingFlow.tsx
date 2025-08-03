import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/api";

interface QuestionOption {
  text: string;
  score: number;
  belief?: string;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

const questions = [
  {
    q: "🧠 You're reading two articles with totally different views. What's your instinct?",
    options: [
      { text: 'Pick the one that feels most right and move on', score: 0.2 },
      { text: 'Compare their facts and side with the stronger case', score: 0.4 },
      { text: 'Consider both valid until more is known', score: 0.6 },
      { text: 'See value in both, even if they conflict', score: 0.8 },
    ],
  },
  {
    q: '🧠 When someone changes their opinion frequently, how do you feel?',
    options: [
      { text: 'I find it unreliable', score: 0.2 },
      { text: 'I question their reasoning', score: 0.4 },
      { text: "I think they're learning", score: 0.6 },
      { text: 'I admire their flexibility', score: 0.8 },
    ],
  },
  {
    q: '🧠 Which statement sounds most like you?',
    options: [
      { text: "There's usually a right and wrong", score: 0.1 },
      { text: 'Truth is often in the middle', score: 0.4 },
      { text: 'It depends on the lens you use', score: 0.7 },
      { text: 'Truth shifts depending on who sees it', score: 0.9 },
    ],
  },
  {
    q: '🧠 When two people disagree passionately, you...',
    options: [
      { text: 'Want to calm things and find one answer', score: 0.2 },
      { text: 'Try to find common ground', score: 0.4 },
      { text: 'Let both express their truth freely', score: 0.6 },
      { text: 'Think the disagreement itself has value', score: 0.8 },
    ],
  },
  {
    q: '🧠 When someone challenges a belief you hold, what happens?',
    options: [
      { text: 'I feel it deeply and defend it', score: 0.2, belief: 'high' },
      { text: 'I feel a little shaken but open to change', score: 0.5, belief: 'moderate' },
      { text: 'I get curious and reconsider', score: 0.8, belief: 'low' },
    ],
  },
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [aiName, setAiName] = useState('');
  const [answers, setAnswers] = useState<number[]>([]);
  const [beliefSensitivity, setBeliefSensitivity] = useState('');

  const totalSteps = 7; // 1 intro + 1 name + 5 questions

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswer = async (score: number, belief?: string) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    // If this option has a belief value, set it and submit
    if (belief) {
      setBeliefSensitivity(belief);
      await handleComplete(newAnswers, belief);
    } else {
      // Otherwise, advance to the next step
      nextStep();
    }
  };

  const handleComplete = async (finalAnswers?: number[], finalBelief?: string) => {
    if (!aiName) {
      toast.error('Please provide an AI name');
      return;
    }

    const answersToUse = finalAnswers || answers;
    const beliefToUse = finalBelief || beliefSensitivity;

    if (answersToUse.length < 5) {
      toast.error('Please complete all questions');
      return;
    }

    setIsLoading(true);
    
    try {
      // Try to get cached setup data, but don't fail if it's not there
      const setupData = sessionStorage.getItem('setupData');
      let email, password, firstName, lastName;
      
      if (setupData) {
        // Use cached data if available
        const parsed = JSON.parse(setupData);
        email = parsed.email;
        password = parsed.password;
        firstName = parsed.firstName;
        lastName = parsed.lastName;
        console.log('Using cached setup data for onboarding');
      } else {
        // For direct signup users, we'll skip the backend registration
        // since they already created their account through the direct signup flow
        console.log('No setup data found - user likely came through direct signup');
        
        toast.success('Profile setup completed! Redirecting to dashboard...');
        onComplete();
        return;
      }
      
      // Calculate contradiction tolerance as average of scores
      const contradictionTolerance = parseFloat((answersToUse.reduce((a, b) => a + b, 0) / answersToUse.length).toFixed(2));

      // Create the API registration payload
      const registrationData = {
        email,
        name: `${firstName} ${lastName}`,
        password,
        machine_name: aiName,
        contradiction_tolerance: contradictionTolerance,
        belief_sensitivity: beliefToUse
      };

      console.log('Registration data:', registrationData);

      // Create the API account
      const response = await apiClient.register(registrationData);
      console.log('API registration successful:', response);

      // Update waitlist status to "registered" (only if we have email)
      if (email) {
        const { error: statusError } = await supabase
          .from('waitlist_submissions')
          .update({ status: 'registered' })
          .eq('email', email);

        if (statusError) {
          console.error('Error updating waitlist status:', statusError);
          // Don't fail the registration if this fails
        }
      }

      // Create the Supabase account as well for local auth (only if we have credentials)
      if (email && password && firstName && lastName) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (authError && !authError.message.includes('already registered')) {
          throw authError;
        }
      }
      
      // Clear setup data
      sessionStorage.removeItem('setupData');
      
      // Mark account as created in approved_users table
      const setupToken = new URLSearchParams(window.location.search).get('setup_token');
      if (setupToken) {
        const { error: updateError } = await supabase
          .from('approved_users')
          .update({ account_created: true })
          .eq('setup_token', setupToken);
        
        if (updateError) {
          console.error('Error updating approved user:', updateError);
        }
      }

      // Sign out the user so they have to log in manually
      await supabase.auth.signOut();

      toast.success('Account created successfully! Please log in.');
      onComplete();
      
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Hello there!
              </h2>
              <p className="text-muted-foreground mt-4">
                I'm here to grow with you—understanding how you think and what matters most to you.
              </p>
              <p className="text-muted-foreground mt-2">
                Let's begin by getting a feel for your unique way of thinking.
              </p>
              <p className="text-muted-foreground mt-2">
                Before we begin, give me a name I'll carry it with me as we grow 🧠 together
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Name Your AI Assistant
              </h2>
              <p className="text-muted-foreground mt-2">What would you like to call me?</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="aiName">AI Assistant Name *</Label>
              <Input
                id="aiName"
                value={aiName}
                onChange={(e) => setAiName(e.target.value)}
                placeholder="Name me..."
                required
                className="text-center text-lg"
              />
            </div>
          </div>
        );

      default:
        // Questions (steps 3-7)
        const questionIndex = currentStep - 3;
        if (questionIndex >= 0 && questionIndex < questions.length) {
          const question = questions[questionIndex];
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-sm text-muted-foreground mb-2">
                  Question {questionIndex + 1} of {questions.length}
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
                <h3 className="text-xl font-medium">{question.q}</h3>
              </div>

              <div className="space-y-3">
                {question.options.map((option: QuestionOption, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleAnswer(option.score, option.belief)}
                  >
                    {option.text}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return true;
    if (currentStep === 2) return aiName.trim() !== '';
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="neural-glass-premium neural-glass-hover">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Setup Your Profile</CardTitle>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent>
            {renderStep()}

            {/* Navigation - only show for non-question steps */}
            {currentStep <= 2 && (
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="neural-glass-hover"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Button 
                  onClick={nextStep} 
                  className="neural-glass-hover"
                  disabled={!canProceed() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Back button for questions */}
            {currentStep > 2 && (
              <div className="flex justify-start mt-8">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="neural-glass-hover"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;

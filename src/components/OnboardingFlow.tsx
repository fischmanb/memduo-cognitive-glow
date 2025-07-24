
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { apiClient } from "@/lib/api";

interface OnboardingData {
  aiName: string;
  familiarityComfort: string;
  perspectiveNeutrality: string;
  uncertaintyHandling: string;
  responseDepth: string;
  domainSpecificity: string;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    aiName: '',
    familiarityComfort: '',
    perspectiveNeutrality: '',
    uncertaintyHandling: '',
    responseDepth: '',
    domainSpecificity: '',
  });

  const totalSteps = 6;

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const handleComplete = async () => {
    // Validate required fields
    const requiredFields = ['aiName', 'familiarityComfort', 'perspectiveNeutrality', 'uncertaintyHandling', 'responseDepth', 'domainSpecificity'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof OnboardingData]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the cached setup data
      const setupData = sessionStorage.getItem('setupData');
      if (!setupData) {
        throw new Error('Setup data not found');
      }

      const { email, password, firstName, lastName } = JSON.parse(setupData);
      
      // Create the belief sensitivity JSON string
      const beliefSensitivityData = {
        familiarityComfort: formData.familiarityComfort,
        perspectiveNeutrality: formData.perspectiveNeutrality,
        uncertaintyHandling: formData.uncertaintyHandling,
        responseDepth: formData.responseDepth,
        domainSpecificity: formData.domainSpecificity
      };

      // Create the API registration payload
      const registrationData = {
        email,
        name: `${firstName} ${lastName}`,
        password,
        machine_name: formData.aiName,
        contradiction_tolerance: 0, // Default value
        belief_sensitivity: JSON.stringify(beliefSensitivityData)
      };

      // Create the API account
      const response = await apiClient.register(registrationData);
      console.log('API registration successful:', response);

      // Update waitlist status to "registered"
      const { error: statusError } = await supabase
        .from('waitlist_submissions')
        .update({ status: 'registered' })
        .eq('email', email);

      if (statusError) {
        console.error('Error updating waitlist status:', statusError);
        // Don't fail the registration if this fails
      }

      // Create the Supabase account as well for local auth
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Name Your AI Assistant
              </h2>
              <p className="text-muted-foreground mt-2">What would you like to call your AI research companion?</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="aiName">AI Assistant Name *</Label>
              <Input
                id="aiName"
                value={formData.aiName}
                onChange={(e) => handleInputChange('aiName', e.target.value)}
                placeholder="e.g., Alex, Research Assistant, Scholar"
                required
                className="text-center text-lg"
              />
              <p className="text-sm text-muted-foreground">Choose a name that feels natural to you</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Familiarity & Comfort
              </h2>
              <p className="text-muted-foreground mt-2">How should your AI communicate with you?</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Communication Style *</Label>
              <RadioGroup 
                value={formData.familiarityComfort} 
                onValueChange={(value) => handleInputChange('familiarityComfort', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="formal" id="formal" />
                  <Label htmlFor="formal" className="flex-1 cursor-pointer">
                    <div className="font-medium">Professional & Formal</div>
                    <div className="text-sm text-muted-foreground">Respectful, academic tone with proper titles</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="friendly" id="friendly" />
                  <Label htmlFor="friendly" className="flex-1 cursor-pointer">
                    <div className="font-medium">Friendly & Approachable</div>
                    <div className="text-sm text-muted-foreground">Warm, conversational, like a knowledgeable colleague</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="casual" id="casual" />
                  <Label htmlFor="casual" className="flex-1 cursor-pointer">
                    <div className="font-medium">Casual & Relaxed</div>
                    <div className="text-sm text-muted-foreground">Informal, like chatting with a smart friend</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Perspective & Neutrality
              </h2>
              <p className="text-muted-foreground mt-2">How should your AI handle controversial topics?</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Approach to Sensitive Topics *</Label>
              <RadioGroup 
                value={formData.perspectiveNeutrality} 
                onValueChange={(value) => handleInputChange('perspectiveNeutrality', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="strict-neutral" id="strict-neutral" />
                  <Label htmlFor="strict-neutral" className="flex-1 cursor-pointer">
                    <div className="font-medium">Strictly Neutral</div>
                    <div className="text-sm text-muted-foreground">Present all sides equally, avoid any stance</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="balanced-analysis" id="balanced-analysis" />
                  <Label htmlFor="balanced-analysis" className="flex-1 cursor-pointer">
                    <div className="font-medium">Balanced Analysis</div>
                    <div className="text-sm text-muted-foreground">Thoughtful examination of different viewpoints</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="evidence-based" id="evidence-based" />
                  <Label htmlFor="evidence-based" className="flex-1 cursor-pointer">
                    <div className="font-medium">Evidence-Based</div>
                    <div className="text-sm text-muted-foreground">Focus on research and empirical evidence</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Uncertainty & Limitations
              </h2>
              <p className="text-muted-foreground mt-2">How should your AI handle uncertain or incomplete information?</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Response to Uncertainty *</Label>
              <RadioGroup 
                value={formData.uncertaintyHandling} 
                onValueChange={(value) => handleInputChange('uncertaintyHandling', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="very-cautious" id="very-cautious" />
                  <Label htmlFor="very-cautious" className="flex-1 cursor-pointer">
                    <div className="font-medium">Very Cautious</div>
                    <div className="text-sm text-muted-foreground">Frequently acknowledge limitations and uncertainty</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="moderate-confidence" id="moderate-confidence" />
                  <Label htmlFor="moderate-confidence" className="flex-1 cursor-pointer">
                    <div className="font-medium">Moderate Confidence</div>
                    <div className="text-sm text-muted-foreground">Balance confidence with appropriate caveats</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="confident-helpful" id="confident-helpful" />
                  <Label htmlFor="confident-helpful" className="flex-1 cursor-pointer">
                    <div className="font-medium">Confident & Helpful</div>
                    <div className="text-sm text-muted-foreground">Provide clear guidance while noting limitations when critical</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Response Depth & Detail
              </h2>
              <p className="text-muted-foreground mt-2">How detailed should your AI's responses be?</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Level of Detail *</Label>
              <RadioGroup 
                value={formData.responseDepth} 
                onValueChange={(value) => handleInputChange('responseDepth', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="concise" id="concise" />
                  <Label htmlFor="concise" className="flex-1 cursor-pointer">
                    <div className="font-medium">Concise & Direct</div>
                    <div className="text-sm text-muted-foreground">Brief, to-the-point answers focusing on key insights</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="balanced" id="balanced" />
                  <Label htmlFor="balanced" className="flex-1 cursor-pointer">
                    <div className="font-medium">Balanced Detail</div>
                    <div className="text-sm text-muted-foreground">Moderate depth with context and examples</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="comprehensive" id="comprehensive" />
                  <Label htmlFor="comprehensive" className="flex-1 cursor-pointer">
                    <div className="font-medium">Comprehensive</div>
                    <div className="text-sm text-muted-foreground">Thorough explanations with background and implications</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Domain Expertise
              </h2>
              <p className="text-muted-foreground mt-2">How should your AI approach specialized knowledge?</p>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Specialized Knowledge Approach *</Label>
              <RadioGroup 
                value={formData.domainSpecificity} 
                onValueChange={(value) => handleInputChange('domainSpecificity', value)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="generalist" id="generalist" />
                  <Label htmlFor="generalist" className="flex-1 cursor-pointer">
                    <div className="font-medium">Broad Generalist</div>
                    <div className="text-sm text-muted-foreground">Wide range of topics with accessible explanations</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="adaptive" id="adaptive" />
                  <Label htmlFor="adaptive" className="flex-1 cursor-pointer">
                    <div className="font-medium">Adaptive Specialist</div>
                    <div className="text-sm text-muted-foreground">Adjust technical depth based on context</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50">
                  <RadioGroupItem value="expert-level" id="expert-level" />
                  <Label htmlFor="expert-level" className="flex-1 cursor-pointer">
                    <div className="font-medium">Expert-Level</div>
                    <div className="text-sm text-muted-foreground">Assume high expertise, use technical language</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="neural-glass p-4 rounded-lg mt-6">
              <h3 className="font-semibold mb-3">Your AI Personality Summary</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><span className="font-medium">Name:</span> {formData.aiName}</p>
                <p><span className="font-medium">Style:</span> {formData.familiarityComfort}</p>
                <p><span className="font-medium">Neutrality:</span> {formData.perspectiveNeutrality}</p>
                <p><span className="font-medium">Uncertainty:</span> {formData.uncertaintyHandling}</p>
                <p><span className="font-medium">Detail:</span> {formData.responseDepth}</p>
                <p><span className="font-medium">Expertise:</span> {formData.domainSpecificity}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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

              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="neural-glass-hover">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleComplete} 
                  className="neural-glass-hover"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;

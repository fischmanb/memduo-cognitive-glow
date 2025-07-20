
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface OnboardingData {
  firstName: string;
  lastName: string;
  role: string;
  organization: string;
  researchArea: string;
  useCase: string;
  timeline: string;
  additionalInfo: string;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  initialData?: Partial<OnboardingData>;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, initialData = {} }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    role: initialData.role || '',
    organization: initialData.organization || '',
    researchArea: initialData.researchArea || '',
    useCase: initialData.useCase || '',
    timeline: initialData.timeline || '',
    additionalInfo: initialData.additionalInfo || '',
  });

  const totalSteps = 4;

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

  const handleComplete = () => {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'role', 'organization', 'researchArea'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof OnboardingData]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    onComplete(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Welcome to MemDuo
              </h2>
              <p className="text-muted-foreground mt-2">Let's get to know you better</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">What's your role? *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="analyst">Data Analyst</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Your Background
              </h2>
              <p className="text-muted-foreground mt-2">Tell us about your organization and focus</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization/Institution *</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder="Enter your organization or institution"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="researchArea">Research Area/Focus *</Label>
              <Input
                id="researchArea"
                value={formData.researchArea}
                onChange={(e) => handleInputChange('researchArea', e.target.value)}
                placeholder="e.g., Machine Learning, Biology, Literature"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                How You'll Use MemDuo
              </h2>
              <p className="text-muted-foreground mt-2">Help us customize your experience</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase">Primary Use Case</Label>
              <Textarea
                id="useCase"
                value={formData.useCase}
                onChange={(e) => handleInputChange('useCase', e.target.value)}
                placeholder="Describe how you plan to use MemDuo (e.g., research analysis, knowledge management, etc.)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">When do you plan to start?</Label>
              <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Immediately</SelectItem>
                  <SelectItem value="this-week">This week</SelectItem>
                  <SelectItem value="this-month">This month</SelectItem>
                  <SelectItem value="next-month">Next month</SelectItem>
                  <SelectItem value="exploring">Just exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                Almost Done!
              </h2>
              <p className="text-muted-foreground mt-2">Any additional information?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Anything else you'd like us to know?"
                rows={4}
              />
            </div>

            <div className="neural-glass p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Summary</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                <p><span className="font-medium">Role:</span> {formData.role}</p>
                <p><span className="font-medium">Organization:</span> {formData.organization}</p>
                <p><span className="font-medium">Research Area:</span> {formData.researchArea}</p>
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
                <Button onClick={handleComplete} className="neural-glass-hover">
                  Complete Setup
                  <CheckCircle className="w-4 h-4 ml-2" />
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

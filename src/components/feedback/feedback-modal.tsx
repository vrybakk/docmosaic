'use client';

import { Button } from '@/components/ui/core/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/data-display/dialog';
import { Label } from '@/components/ui/form/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/form/radio-group';
import { Textarea } from '@/components/ui/form/textarea';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';

type FeedbackType = 'bug' | 'feature' | 'general';


interface FeedbackModalProps {
    customButton?: React.ReactNode;
}

export default function FeedbackModal({ customButton }: FeedbackModalProps) {
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            console.log({
                type: feedbackType,
                feedback: feedbackText,
            });

            await new Promise((resolve) => setTimeout(resolve, 1000));

            setIsSubmitted(true);
            setFeedbackText('');
            setFeedbackType('general');

            setTimeout(() => {
                setIsOpen(false);
                setTimeout(() => setIsSubmitted(false), 300);
            }, 2000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {customButton ? customButton : (
                    <Button variant="outline" size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Feedback
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send Feedback</DialogTitle>
                </DialogHeader>
                {isSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="rounded-full bg-green-100 p-3 mb-4">
                            <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Thank you!</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Your feedback has been submitted successfully.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="feedback-type">Feedback Type</Label>
                            <RadioGroup
                                id="feedback-type"
                                value={feedbackType}
                                onValueChange={(value) => setFeedbackType(value as FeedbackType)}
                                className="flex flex-col space-y-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="bug" id="bug" />
                                    <Label htmlFor="bug" className="font-normal">
                                        Bug Report
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="feature" id="feature" />
                                    <Label htmlFor="feature" className="font-normal">
                                        Feature Request
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="general" id="general" />
                                    <Label htmlFor="general" className="font-normal">
                                        General Feedback
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="feedback-text">Your Feedback</Label>
                            <Textarea
                                id="feedback-text"
                                placeholder="Tell us what you think..."
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting || !feedbackText.trim()}>
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

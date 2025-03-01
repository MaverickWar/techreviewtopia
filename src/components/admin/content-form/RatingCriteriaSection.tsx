
import { useState, useEffect } from "react";
import { RatingCriterion } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface RatingCriteriaSectionProps {
  criteria: RatingCriterion[];
  onChange: (criteria: RatingCriterion[]) => void;
  calculatedOverallScore: number;
}

export const RatingCriteriaSection = ({
  criteria,
  onChange,
  calculatedOverallScore
}: RatingCriteriaSectionProps) => {
  
  // Rating criterion handlers
  const addRatingCriterion = () => {
    onChange([...criteria, { name: '', score: 0 }]);
  };

  const updateRatingCriterion = (index: number, field: 'name' | 'score', value: string | number) => {
    onChange(
      criteria.map((criterion, i) =>
        i === index ? { ...criterion, [field]: value } : criterion
      )
    );
  };

  const removeRatingCriterion = (index: number) => {
    onChange(criteria.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Rating Criteria</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Overall Score: </span>
          <span className="text-lg font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
            {calculatedOverallScore.toFixed(1)}
          </span>
        </div>
      </div>
      
      {criteria.map((criterion, index) => (
        <div key={index} className="flex items-center gap-3">
          <Input
            placeholder="Criterion name"
            value={criterion.name}
            onChange={(e) => updateRatingCriterion(index, 'name', e.target.value)}
          />
          <div className="w-28">
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={criterion.score}
              onChange={(e) => updateRatingCriterion(index, 'score', parseFloat(e.target.value) || 0)}
            />
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={() => removeRatingCriterion(index)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRatingCriterion}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Criterion
      </Button>
    </div>
  );
};

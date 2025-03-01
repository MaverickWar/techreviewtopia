
import { ProductSpec } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface ProductSpecsSectionProps {
  specs: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
}

export const ProductSpecsSection = ({
  specs,
  onChange
}: ProductSpecsSectionProps) => {
  
  // Product spec handlers
  const addProductSpec = () => {
    onChange([...specs, { label: '', value: '' }]);
  };

  const updateProductSpec = (index: number, field: 'label' | 'value', value: string) => {
    onChange(
      specs.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      )
    );
  };

  const removeProductSpec = (index: number) => {
    onChange(specs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Product Specifications</h3>
      
      {specs.map((spec, index) => (
        <div key={index} className="flex items-center gap-3">
          <Input
            placeholder="Specification name"
            value={spec.label}
            onChange={(e) => updateProductSpec(index, 'label', e.target.value)}
          />
          <Input
            placeholder="Value"
            value={spec.value}
            onChange={(e) => updateProductSpec(index, 'value', e.target.value)}
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={() => removeProductSpec(index)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addProductSpec}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Specification
      </Button>
    </div>
  );
};

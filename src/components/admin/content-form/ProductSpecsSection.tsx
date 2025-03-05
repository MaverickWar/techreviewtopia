
import { ProductSpec } from "./types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

interface ProductSpecsSectionProps {
  specs: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
}

export const ProductSpecsSection = ({
  specs,
  onChange
}: ProductSpecsSectionProps) => {
  const [currentCategory, setCurrentCategory] = useState("General");
  
  // Product spec handlers
  const addProductSpec = (category = currentCategory) => {
    // Find if we already have specs for this category
    const existingCategoryIndex = specs.findIndex(spec => spec.category === category);
    
    if (existingCategoryIndex >= 0) {
      // Add to existing category
      const newSpecs = [...specs];
      newSpecs[existingCategoryIndex] = {
        ...newSpecs[existingCategoryIndex],
        specs: [...newSpecs[existingCategoryIndex].specs, { label: '', value: '' }]
      };
      onChange(newSpecs);
    } else {
      // Create new category
      onChange([...specs, { 
        category,
        specs: [{ label: '', value: '' }]
      }]);
    }
  };

  const addCategory = () => {
    if (currentCategory && !specs.some(spec => spec.category === currentCategory)) {
      addProductSpec(currentCategory);
    }
  };

  const updateProductSpec = (categoryIndex: number, specIndex: number, field: 'label' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[categoryIndex] = {
      ...newSpecs[categoryIndex],
      specs: [...newSpecs[categoryIndex].specs]
    };
    newSpecs[categoryIndex].specs[specIndex] = {
      ...newSpecs[categoryIndex].specs[specIndex],
      [field]: value
    };
    onChange(newSpecs);
  };

  const removeProductSpec = (categoryIndex: number, specIndex: number) => {
    const newSpecs = [...specs];
    
    // Remove the spec
    newSpecs[categoryIndex] = {
      ...newSpecs[categoryIndex],
      specs: newSpecs[categoryIndex].specs.filter((_, i) => i !== specIndex)
    };
    
    // If no more specs in this category, remove the category
    if (newSpecs[categoryIndex].specs.length === 0) {
      onChange(newSpecs.filter((_, i) => i !== categoryIndex));
    } else {
      onChange(newSpecs);
    }
  };

  const updateCategoryName = (index: number, newName: string) => {
    const newSpecs = [...specs];
    newSpecs[index] = {
      ...newSpecs[index],
      category: newName
    };
    onChange(newSpecs);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Product Specifications</h3>
      
      <div className="space-y-6">
        {specs.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-md">
            <p className="text-gray-500">No specifications added yet.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addProductSpec()}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Specification
            </Button>
          </div>
        ) : (
          specs.map((categoryGroup, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3 p-4 border rounded-md">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Category name"
                  value={categoryGroup.category}
                  onChange={(e) => updateCategoryName(categoryIndex, e.target.value)}
                  className="font-medium"
                />
              </div>
              
              <Separator className="my-3" />
              
              {categoryGroup.specs.map((spec, specIndex) => (
                <div key={specIndex} className="flex items-center gap-3">
                  <Input
                    placeholder="Specification name"
                    value={spec.label}
                    onChange={(e) => updateProductSpec(categoryIndex, specIndex, 'label', e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => updateProductSpec(categoryIndex, specIndex, 'value', e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeProductSpec(categoryIndex, specIndex)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addProductSpec(categoryGroup.category)}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Specification to {categoryGroup.category}
              </Button>
            </div>
          ))
        )}
      </div>
      
      <div className="flex items-end gap-3 mt-4">
        <div className="flex-1">
          <Input
            placeholder="New category name"
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addCategory}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
    </div>
  );
};

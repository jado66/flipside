"use client";
import { initialSkills } from "./initialSkills";
import { Skill } from "./skill-types";
import { Handle, Position } from "@xyflow/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SkillNode({ data }: { data: any }) {
  const { skill, onToggle } = data;

  const getNodeColors = () => {
    return skill.completed
      ? "bg-green-50 border-green-300 text-green-800"
      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(skill.id);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              relative px-4 py-3 rounded-lg border-2 min-w-[120px] text-center cursor-pointer
              transition-all duration-200 hover:scale-105 ${getNodeColors()}
            `}
            onClick={handleClick}
          >
            <Handle
              type="target"
              position={Position.Left}
              style={{ opacity: 0 }}
            />
            <div className="text-sm font-medium">{skill.name}</div>
            <Handle
              type="source"
              position={Position.Right}
              style={{ opacity: 0 }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">{skill.name}</div>
            <div className="text-sm">{skill.description}</div>
            {skill.prerequisites.length > 0 && (
              <div className="text-xs">
                <div className="font-medium">Prerequisites:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {skill.prerequisites.map((prereqId: string) => (
                    <span
                      key={prereqId}
                      className="px-2 py-1 bg-gray-200 rounded text-xs"
                    >
                      {initialSkills.find((s) => s.id === prereqId)?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

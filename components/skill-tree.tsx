"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SkillNode } from "./SkillNode";
import { initialSkills } from "./initialSkills";
import { Skill } from "./skill-types";

export function SkillTree() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const toggleSkill = useCallback((skillId: string) => {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.id === skillId ? { ...skill, completed: !skill.completed } : skill
      )
    );
  }, []);
  const nodeTypes = {
    skillNode: SkillNode,
  };
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodesByTier: { [key: number]: Skill[] } = {};
    skills.forEach((skill) => {
      if (!nodesByTier[skill.tier]) nodesByTier[skill.tier] = [];
      nodesByTier[skill.tier].push(skill);
    });

    const nodes: Node[] = [];
    Object.entries(nodesByTier).forEach(([tier, tierSkills]) => {
      const tierNum = Number.parseInt(tier);
      const x = tierNum * 175; // Horizontal spacing between tiers
      const spacing = 120;
      const startY = (-(tierSkills.length - 1) * spacing) / 2;

      tierSkills.forEach((skill, index) => {
        nodes.push({
          id: skill.id,
          type: "skillNode",
          position: { x, y: startY + index * spacing },
          data: {
            skill,
            onToggle: toggleSkill,
          },
        });
      });
    });

    // Create edges for prerequisites
    const edges: Edge[] = [];
    skills.forEach((skill) => {
      skill.prerequisites.forEach((prereqId) => {
        const prereqSkill = skills.find((s) => s.id === prereqId);

        // Only create edge if prerequisite skill exists
        if (prereqSkill) {
          edges.push({
            id: `${prereqId}-${skill.id}`,
            source: prereqId,
            target: skill.id,
            style: {
              stroke:
                prereqSkill?.completed && skill.completed
                  ? "#10b981"
                  : "#374151",
              strokeWidth: 3,
              strokeDasharray:
                prereqSkill?.completed && skill.completed ? "0" : "5,5",
            },
            animated: false,
            type: "default",
          });
        } else {
          console.warn(
            `Prerequisite skill not found: ${prereqId} for skill: ${skill.id}`
          );
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [skills, toggleSkill]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when skills change
  useEffect(() => {
    // Update nodes with current skill data
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          skill: skills.find((s) => s.id === node.id),
          onToggle: toggleSkill,
        },
      }))
    );

    // Recreate edges based on current skills
    const updatedEdges: Edge[] = [];
    skills.forEach((skill) => {
      skill.prerequisites.forEach((prereqId) => {
        const sourceSkill = skills.find((s) => s.id === prereqId);
        const targetSkill = skill;

        updatedEdges.push({
          id: `${prereqId}-${skill.id}`,
          source: prereqId,
          target: skill.id,
          style: {
            stroke:
              sourceSkill?.completed && targetSkill?.completed
                ? "#10b981"
                : "#374151",
            strokeWidth: 3,
            strokeDasharray:
              sourceSkill?.completed && targetSkill?.completed ? "0" : "5,5",
          },
          animated: false,
          type: "default",
        });
      });
    });

    setEdges(updatedEdges);
  }, [skills, toggleSkill, setNodes, setEdges]);

  return (
    <div className="w-full h-[800px] bg-gray-50 rounded-lg border relative">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeClick={(event, node) => {
          console.log("[v0] ReactFlow node clicked:", node.id);
        }}
      >
        <Controls />
        {/* @ts-expect-error React flow error */}
        <Background variant="dots" gap={20} size={1} />
      </ReactFlow>

      <div className="absolute bottom-4 right-4 bg-white border rounded-lg p-3 shadow-lg z-10">
        <div className="text-sm font-semibold mb-2">Progress Tracker</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-300 rounded" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
            <span>Not completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

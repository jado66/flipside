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
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { supabase } from "@/lib/supabase/supabase-client";

// Types
interface Trick {
  id: string;
  name: string;
  slug: string;
  prerequisites: string[] | null;
  difficulty_level: number | null;
  subcategory?: {
    name: string;
    slug: string;
    master_category?: {
      name: string;
      slug: string;
      color: string | null;
    };
  };
}

interface MasterCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon_name: string | null;
}

interface TrickNodeData {
  trick: Trick;
  completed: boolean;
  onToggle: (id: string) => void;
  categoryColor: string;
}

// Custom Node Component
const TrickNode = ({ data }: { data: TrickNodeData }) => {
  const { trick, completed, onToggle, categoryColor } = data;

  return (
    <div
      onClick={() => onToggle(trick.id)}
      className={`
        px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
        min-w-[180px] max-w-[220px] text-center
        ${
          completed
            ? `bg-green-50 border-green-400 shadow-lg`
            : "bg-white border-gray-300 hover:border-gray-400 shadow-md"
        }
      `}
      style={{
        borderColor: completed ? categoryColor || "#10b981" : undefined,
        backgroundColor: completed
          ? `${categoryColor}15` || "#f0fdf4"
          : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <div className="font-semibold text-sm mb-1">{trick.name}</div>
      {trick.difficulty_level && (
        <div className="text-xs text-gray-500">
          Difficulty: {trick.difficulty_level}/10
        </div>
      )}
      {trick.prerequisites && trick.prerequisites.length > 0 && (
        <div className="text-xs text-gray-400 mt-1">
          {trick.prerequisites.length} prerequisite
          {trick.prerequisites.length > 1 ? "s" : ""}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
};

// Main Component
export function SkillTree() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tricks, setTricks] = useState<Trick[]>([]);
  const [completedTricks, setCompletedTricks] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch master categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch tricks when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchTricksByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("master_categories")
        .select("id, name, slug, color, icon_name")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      setCategories(data || []);

      // Auto-select first category
      if (data && data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    }
  };

  const fetchTricksByCategory = async (categoryId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("tricks")
        .select(
          `
          id,
          name,
          slug,
          prerequisites,
          difficulty_level,
          subcategory:subcategories!inner(
            name,
            slug,
            master_category:master_categories!inner(
              id,
              name,
              slug,
              color
            )
          )
        `
        )
        .eq("subcategory.master_category.id", categoryId)
        .eq("is_published", true)
        .order("difficulty_level", { ascending: true, nullsFirst: true });

      if (error) throw error;
      setTricks(data || []);
    } catch (err) {
      console.error("Error fetching tricks:", err);
      setError("Failed to load tricks");
    } finally {
      setLoading(false);
    }
  };

  const toggleTrick = useCallback((trickId: string) => {
    setCompletedTricks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(trickId)) {
        newSet.delete(trickId);
      } else {
        newSet.add(trickId);
      }
      return newSet;
    });
  }, []);

  const nodeTypes = useMemo(
    () => ({
      trickNode: TrickNode,
    }),
    []
  );

  // Build nodes and edges from tricks
  const { nodes, edges } = useMemo(() => {
    if (tricks.length === 0) return { nodes: [], edges: [] };

    const currentCategory = categories.find((c) => c.id === selectedCategory);
    const categoryColor = currentCategory?.color || "#3b82f6";

    // Create a map of trick names to IDs for prerequisite matching
    const trickNameToId = new Map<string, string>();
    tricks.forEach((trick) => {
      trickNameToId.set(trick.name.toLowerCase(), trick.id);
    });

    // Determine tiers based on prerequisites
    const trickTiers = new Map<string, number>();
    const trickById = new Map<string, Trick>();

    tricks.forEach((trick) => {
      trickById.set(trick.id, trick);
    });

    // Function to calculate tier recursively
    const calculateTier = (
      trickId: string,
      visited = new Set<string>()
    ): number => {
      if (visited.has(trickId)) return 0; // Circular dependency protection
      visited.add(trickId);

      if (trickTiers.has(trickId)) {
        return trickTiers.get(trickId)!;
      }

      const trick = trickById.get(trickId);
      if (!trick || !trick.prerequisites || trick.prerequisites.length === 0) {
        trickTiers.set(trickId, 0);
        return 0;
      }

      let maxPrereqTier = -1;
      trick.prerequisites.forEach((prereqName) => {
        const prereqId = trickNameToId.get(prereqName.toLowerCase());
        if (prereqId && trickById.has(prereqId)) {
          const prereqTier = calculateTier(prereqId, new Set(visited));
          maxPrereqTier = Math.max(maxPrereqTier, prereqTier);
        }
      });

      const tier = maxPrereqTier + 1;
      trickTiers.set(trickId, tier);
      return tier;
    };

    // Calculate tiers for all tricks
    tricks.forEach((trick) => calculateTier(trick.id));

    // Group tricks by tier
    const tierGroups = new Map<number, Trick[]>();
    tricks.forEach((trick) => {
      const tier = trickTiers.get(trick.id) || 0;
      if (!tierGroups.has(tier)) {
        tierGroups.set(tier, []);
      }
      tierGroups.get(tier)!.push(trick);
    });

    // Create nodes
    const nodes: Node[] = [];
    const nodeSpacingX = 250;
    const nodeSpacingY = 100;

    tierGroups.forEach((tierTricks, tier) => {
      const x = tier * nodeSpacingX;
      const startY = (-(tierTricks.length - 1) * nodeSpacingY) / 2;

      tierTricks.forEach((trick, index) => {
        nodes.push({
          id: trick.id,
          type: "trickNode",
          position: {
            x,
            y: startY + index * nodeSpacingY,
          },
          data: {
            trick,
            completed: completedTricks.has(trick.id),
            onToggle: toggleTrick,
            categoryColor,
          },
        });
      });
    });

    // Create edges based on prerequisites
    const edges: Edge[] = [];
    tricks.forEach((trick) => {
      if (trick.prerequisites && trick.prerequisites.length > 0) {
        trick.prerequisites.forEach((prereqName) => {
          const sourceId = trickNameToId.get(prereqName.toLowerCase());
          if (sourceId && trickById.has(sourceId)) {
            const isCompleted =
              completedTricks.has(sourceId) && completedTricks.has(trick.id);
            edges.push({
              id: `${sourceId}-${trick.id}`,
              source: sourceId,
              target: trick.id,
              type: "smoothstep",
              animated: isCompleted,
              style: {
                stroke: isCompleted ? categoryColor : "#9ca3af",
                strokeWidth: 2,
                strokeDasharray: isCompleted ? "0" : "5,5",
              },
            });
          }
        });
      }
    });

    return { nodes, edges };
  }, [tricks, categories, selectedCategory, completedTricks, toggleTrick]);

  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Update flow when nodes/edges change
  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Category Selector */}
      <div className="bg-white border-b p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Skill Tree Visualizer</h1>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all font-medium
                  ${
                    selectedCategory === category.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }
                `}
                style={{
                  borderColor:
                    selectedCategory === category.id
                      ? category.color || undefined
                      : undefined,
                  backgroundColor:
                    selectedCategory === category.id
                      ? `${category.color}15` || undefined
                      : undefined,
                  color:
                    selectedCategory === category.id
                      ? category.color || undefined
                      : undefined,
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-lg font-medium">Loading tricks...</div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-10">
            {error}
          </div>
        )}

        {!loading && tricks.length === 0 && selectedCategory && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500">
              No tricks found in this category
            </div>
          </div>
        )}

        {tricks.length > 0 && (
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
          >
            <Controls />
            <Background variant="dots" gap={20} size={1} />
          </ReactFlow>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white border rounded-lg p-3 shadow-lg">
          <div className="text-sm font-semibold mb-2">Legend</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 rounded"
                style={{
                  backgroundColor: `${currentCategory?.color || "#10b981"}15`,
                  borderColor: currentCategory?.color || "#10b981",
                }}
              />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
              <span>Not completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 border-t-2 border-dashed border-gray-400" />
              <span>Prerequisites</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
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
import dagre from "dagre";
import { useAuth } from "@/contexts/auth-provider";
import { Trick, MasterCategory, TrickNodeData } from "./skill-tree.types";
import { levenshtein } from "./levenshtein";
import TrickNode from "./TrickNode";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { useSupabase } from "@/utils/supabase/useSupabase";

export function SkillTree({ selectedCategory }: { selectedCategory: string }) {
  const supabase = useSupabase();
  // Confetti burst function
  const triggerConfetti = useCallback(() => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };
    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [
          "#ff0000",
          "#00ff00",
          "#0000ff",
          "#ffff00",
          "#ff00ff",
          "#00ffff",
        ],
      });
    }, 300);
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#ffd700", "#ff6347", "#98fb98", "#87ceeb"],
      });
    }, 600);
  }, []);
  // Format slug for display (capitalize, replace dashes)
  const formattedSlug = useMemo(() => {
    if (!selectedCategory) return "Skill Tree";
    return selectedCategory
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [selectedCategory]);
  // Responsive: track mobile screen size
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [tricks, setTricks] = useState<Trick[]>([]);
  const { user } = useAuth();
  const [userCanDoTricks, setUserCanDoTricks] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch master categories on mount
  useEffect(() => {
    if (!supabase) return;

    const fetchCategoriesAndTricks = async () => {
      try {
        // Fetch all categories
        const { data: categoriesData, error: catError } = await supabase
          .from("master_categories")
          .select("id, name, slug, color, icon_name")
          .eq("is_active", true)
          .order("sort_order");
        if (catError) throw catError;
        setCategories(categoriesData || []);

        // Find category by slug
        const categoryObj = (categoriesData || []).find(
          (c) => c.slug === selectedCategory
        );
        if (!categoryObj) {
          setError("Category not found");
          setTricks([]);
          return;
        }

        // Fetch tricks by category UUID
        await fetchTricksByCategory(categoryObj.id);
      } catch (err) {
        console.error("Error fetching categories or tricks:", err);
        setError("Failed to load categories or tricks");
      }
    };
    if (selectedCategory) {
      fetchCategoriesAndTricks();
    }
  }, [selectedCategory, supabase]);

  // Fetch user's can-do tricks on mount and when user changes
  useEffect(() => {
    if (!supabase) return;

    const fetchUserCanDoTricks = async () => {
      if (!user) {
        setUserCanDoTricks(new Set());
        return;
      }
      try {
        const { data, error } = await supabase
          .from("user_tricks")
          .select("trick_id")
          .eq("user_id", user.id)
          .eq("can_do", true);
        if (error) {
          console.error("Error fetching user tricks:", error);
          return;
        }
        const canDoSet = new Set(data?.map((record) => record.trick_id) || []);
        setUserCanDoTricks(canDoSet);
      } catch (error) {
        console.error("Failed to fetch user's tricks:", error);
      }
    };
    fetchUserCanDoTricks();
  }, [user, supabase]);

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
          prerequisite_ids,
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
      // @ts-expect-error fix me
      setTricks(data || []);
    } catch (err) {
      console.error("Error fetching tricks:", err);
      setError("Failed to load tricks");
    } finally {
      setLoading(false);
    }
  };

  // Memoize handleToggleCanDo with useCallback to prevent recreation
  const handleToggleCanDo = useCallback(
    async (trickId: string, currentStatus: boolean) => {
      if (!user) {
        // For unauthenticated users, just update in memory and show toast only when marking as learned
        setUserCanDoTricks((prev) => {
          const newSet = new Set(prev);
          if (currentStatus) {
            newSet.delete(trickId);
          } else {
            newSet.add(trickId);
            toast.success(
              "Awesome! You learned a new trick! Create an account to save your progress."
            );
            triggerConfetti();
          }
          return newSet;
        });
        return;
      }
      // For authenticated users, only show toast after successful DB update
      setUserCanDoTricks((prev) => {
        const newSet = new Set(prev);
        if (currentStatus) {
          newSet.delete(trickId);
        } else {
          newSet.add(trickId);
        }
        return newSet;
      });
      try {
        if (!currentStatus) {
          const { error } = await supabase.from("user_tricks").upsert({
            user_id: user.id,
            trick_id: trickId,
            can_do: true,
            achieved_at: new Date().toISOString(),
          });
          if (error) throw error;
          toast.success("Awesome! You learned a new trick! Keep it up!");
          triggerConfetti();
        } else {
          const { error } = await supabase
            .from("user_tricks")
            .delete()
            .eq("user_id", user.id)
            .eq("trick_id", trickId);
          if (error) throw error;
          toast("Trick removed from learned tricks");
        }
      } catch (error) {
        console.error("Failed to toggle can-do status:", error);
        toast.error("Failed to update trick status");
        setUserCanDoTricks((prev) => {
          const newSet = new Set(prev);
          if (currentStatus) {
            newSet.add(trickId);
          } else {
            newSet.delete(trickId);
          }
          return newSet;
        });
      }
    },
    [user, triggerConfetti]
  );

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

    // Create maps
    const lowerNameToId = new Map<string, string>();
    const trickById = new Map<string, Trick>();

    tricks.forEach((trick) => {
      trickById.set(trick.id, trick);
      const normName = trick.name.toLowerCase().replace(/\s+/g, " ").trim();
      if (!lowerNameToId.has(normName)) {
        // Avoid duplicates if any
        lowerNameToId.set(normName, trick.id);
      }
    });

    // Matching function for prerequisites (handles names, IDs, or fuzzy)
    const getPrereqId = (prereq: string): string | null => {
      const normPrereq = prereq.toLowerCase().replace(/\s+/g, " ").trim();
      let prereqId = lowerNameToId.get(normPrereq);
      if (prereqId) {
        return prereqId;
      }

      // Check if it's a direct ID
      const trimmedPrereq = prereq.trim();
      if (trickById.has(trimmedPrereq)) {
        console.log(`Matched prerequisite as direct ID: "${trimmedPrereq}"`);
        return trimmedPrereq;
      }

      // Fuzzy matching
      let minDist = Infinity;
      let bestNorm: string | null = null;
      for (const norm of lowerNameToId.keys()) {
        const dist = levenshtein(norm, normPrereq);
        if (dist < minDist) {
          minDist = dist;
          bestNorm = norm;
        }
      }

      if (
        bestNorm &&
        (minDist <= 2 || minDist / (normPrereq.length + 1) < 0.2)
      ) {
        prereqId = lowerNameToId.get(bestNorm);
        console.log(
          `Fuzzy matched "${prereq}" to "${bestNorm}" with distance ${minDist}`
        );
        return prereqId!;
      }

      console.warn(`Prerequisite "${prereq}" not found`);
      return null;
    };

    // Create nodes with temporary positions
    let nodes: Node[] = tricks.map((trick) => ({
      id: trick.id,
      type: "trickNode",
      position: { x: 0, y: 0 },
      data: {
        trick,
        completed: userCanDoTricks.has(trick.id),
        onToggle: () =>
          handleToggleCanDo(trick.id, userCanDoTricks.has(trick.id)),
        categoryColor,
        isMobile,
      },
    }));

    // Create edges
    const edges: Edge[] = [];
    const edgeSet = new Set<string>();

    tricks.forEach((trick) => {
      if (trick.prerequisite_ids && trick.prerequisite_ids.length > 0) {
        trick.prerequisite_ids.forEach((prereqId) => {
          if (trickById.has(prereqId)) {
            const edgeId = `${prereqId}-${trick.id}`;
            if (!edgeSet.has(edgeId)) {
              edgeSet.add(edgeId);
              const isCompleted =
                userCanDoTricks.has(prereqId) && userCanDoTricks.has(trick.id);
              edges.push({
                id: edgeId,
                source: prereqId,
                target: trick.id,
                type: "smoothstep",
                animated: isCompleted,
                style: {
                  stroke: isCompleted ? "#22c55e" : "#9ca3af", // Green for can do
                  strokeWidth: 2,
                  strokeDasharray: isCompleted ? "0" : "5,5",
                },
              });
              console.log(
                `Created edge: ${trickById.get(prereqId)?.name} -> ${
                  trick.name
                }`
              );
            }
          } else {
            console.warn(
              `Could not create edge: prerequisite id "${prereqId}" not found for trick "${trick.name}"`
            );
          }
        });
      }
    });

    console.log("Final edges:", edges.length, edges);

    // Apply Dagre layout if there are nodes
    if (nodes.length > 0) {
      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));
      // Use vertical layout on mobile, horizontal otherwise
      const rankdir = isMobile ? "TB" : "LR";
      dagreGraph.setGraph({ rankdir, nodesep: 50, ranksep: 150 });

      const nodeWidth = 220;
      const nodeHeight = 80;

      nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
      });

      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      dagre.layout(dagreGraph);

      nodes = nodes.map((node) => {
        const { x, y } = dagreGraph.node(node.id);
        return {
          ...node,
          position: {
            x: x - nodeWidth / 2,
            y: y - nodeHeight / 2,
          },
        };
      });
    }

    console.log("Final nodes:", nodes.length, nodes);

    return { nodes, edges };
  }, [
    tricks,
    categories,
    selectedCategory,
    userCanDoTricks,
    handleToggleCanDo, // Now stable due to useCallback
  ]);

  // Initialize flow state with the computed nodes and edges
  const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Update flow when nodes/edges change - now with proper dependencies
  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Hide lock button on all devices (robust selector) */}
      <style>{`
        .react-flow__controls [aria-label="lock"],
        .react-flow__controls [aria-label="Lock"],
        .react-flow__controls [title="Lock"] {
          display: none !important;
        }
      `}</style>
      {isMobile && (
        <style>{`
          .react-flow__controls-button {
            width: 48px !important;
            height: 48px !important;
            font-size: 1.5rem !important;
          }
        `}</style>
      )}
      {/* Floating Header with alert */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg z-20 min-w-[320px] text-center flex flex-col items-center">
        <h1 className="text-2xl font-bold">{formattedSlug} Skill Tree</h1>
        {!user && (
          <div className=" text-yellow-700  px-4 rounded w-full mt-1 ">
            <p className="mb-1 flex items-center justify-center text-sm">
              <Info className="mr-2 h-4 w-4" />
              Progress won&apos;t be saved without being logged into an account.{" "}
            </p>
          </div>
        )}
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
            minZoom={0.1}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Controls showInteractive={false} />
            {/* @ts-expect-error from <ReactFlow> */}
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
                  borderColor: "#32792cff",
                  backgroundColor: "#36b32bff",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(50,121,44,0.15)",
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
            <div className="flex items-center gap-2 mt-2">
              <span className="font-semibold">Completed:</span>
              <span>
                {flowNodes.filter((n) => n.data?.completed).length} /{" "}
                {flowNodes.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

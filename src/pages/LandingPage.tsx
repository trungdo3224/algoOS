import React, { useState } from 'react';
import { 
  Mic, 
  MessageSquareCode, 
  Code2, 
  ArrowRight, 
  Check, 
  Terminal, 
  Layers, 
  Sparkles,
  Activity
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useAppDispatch } from '../hooks/reduxHooks';
import { loginAsDemo } from '../features/user/userSlice';
import { navigateTo } from '../utils/navigation';

const LandingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'voice' | 'ssa' | 'reverse'>('voice');
  const [activeSsaStage, setActiveSsaStage] = useState(2); // Default to Intuition stage
  const [selectedReverseCode, setSelectedReverseCode] = useState(0);

  const handleLaunchDemo = () => {
    dispatch(loginAsDemo());
    navigateTo('/dashboard');
  };

  const ssaStages = [
    {
      num: 1,
      name: "Comprehension",
      role: "Input/Output & Constraints",
      learner: "Given an array of temperatures, for each day return the number of days until a warmer day. If no warmer day exists, return 0.",
      coach: "Good start. What is the upper bound on temperature values, and how large can the array get?",
      validation: "Confirmed: temperatures.length <= 10^5, values within [30, 100]."
    },
    {
      num: 2,
      name: "Boundary Constraints",
      role: "Time/Space Budget",
      learner: "With N up to 10^5, an O(N^2) pairwise nested loop approach would perform 10^10 operations and exceed the 1-second time limit.",
      coach: "Precisely. What algorithmic order must our target solution respect?",
      validation: "Invariant: Target time complexity must be strictly O(N) or O(N log N)."
    },
    {
      num: 3,
      name: "Intuition & Pattern",
      role: "Invariant Derivation",
      learner: "We want to remember prior unresolved days until we see a strictly warmer day. We can maintain a monotonic decreasing stack of indices.",
      coach: "Excellent insight. Why should the stack hold indices rather than raw temperatures?",
      validation: "Deduction: Indices allow calculating day span (`current_index - stack.pop()`)."
    },
    {
      num: 4,
      name: "Dry-Run Simulation",
      role: "Edge Case Trace",
      learner: "Trace on [73, 74, 75, 71, 69, 72]: Day 0 (73) pushes. Day 1 (74 > 73) pops 73, span = 1 - 0 = 1. Day 5 (72 > 69) pops 69, span = 5 - 4 = 1.",
      coach: "What happens to elements left in the stack at termination?",
      validation: "Handled: Default initialized result array contains 0 for remaining indices."
    },
    {
      num: 5,
      name: "Complexity Proof",
      role: "Space-Time Tradeoff",
      learner: "Each index is pushed onto the stack exactly once and popped at most once. Amortized runtime is O(N). Space is O(N) worst-case (strictly decreasing).",
      coach: "Proof validated. All constraints satisfied without spoilers. Ready to implement.",
      validation: "Verification passed. Proceed to coding."
    }
  ];

  const reverseExamples = [
    {
      name: "Monotonic Stack",
      code: `def dailyTemperatures(temps: list[int]) -> list[int]:
    n = len(temps)
    res = [0] * n
    stack = []  # stores indices
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            prev_i = stack.pop()
            res[prev_i] = i - prev_i
        stack.append(i)
    return res`,
      deducedTitle: "Daily Temperatures [Monotonic Stack Invariant]",
      inferredPattern: "Monotonic Decreasing Index Stack",
      inferredConstraints: ["N <= 10^5 (demands O(N) amortized)", "Negative numbers: N/A (temps in [30, 100])", "Output format: span difference `i - prev_i`"],
      edgeCases: ["Strictly decreasing sequence [90, 80, 70] -> [0, 0, 0]", "All identical temperatures [70, 70, 70] -> [0, 0, 0]"]
    },
    {
      name: "Sliding Window",
      code: `def minSubArrayLen(target: int, nums: list[int]) -> int:
    left = 0
    curr_sum = 0
    min_len = float('inf')
    for right in range(len(nums)):
        curr_sum += nums[right]
        while curr_sum >= target:
            min_len = min(min_len, right - left + 1)
            curr_sum -= nums[left]
            left += 1
    return min_len if min_len != float('inf') else 0`,
      deducedTitle: "Minimum Size Subarray Sum",
      inferredPattern: "Dynamic Shrinking Two-Pointer Window",
      inferredConstraints: ["All nums are positive integers (enables monotonic sum property)", "Target > 0", "Time Complexity: O(N)"],
      edgeCases: ["Sum of entire array < target -> return 0", "Single element >= target -> return 1"]
    },
    {
      name: "Interval Sweep",
      code: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged`,
      deducedTitle: "Merge Overlapping Intervals",
      inferredPattern: "Greedy Sort by Start Boundary",
      inferredConstraints: ["Intervals: [start, end] with start <= end", "Requires O(N log N) initial sort", "In-place or O(N) merged space"],
      edgeCases: ["Nested interval [[1, 4], [2, 3]] -> [[1, 4]]", "Disjoint series [[1, 2], [3, 4]] -> unaltered"]
    }
  ];

  return (
    <div className="flex-1 w-full text-zinc-950 font-sans selection:bg-zinc-800 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-zinc-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            {/* Architectural Kicker Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200/90 bg-zinc-100 text-[11px] font-mono text-zinc-600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>algoOS v2.4 // COGNITIVE ALGORITHMIC WORKBENCH</span>
            </div>

            {/* Confident, Anti-Slop Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-zinc-950 leading-[1.05] mb-6">
              The Algorithmic Reasoning Workbench.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto font-normal mb-8">
              Speak your problem-solving thoughts aloud. AlgoMind analyzes your cognitive pauses, 
              guides your logic with 5-stage Socratic rigor, and decodes problem invariants in reverse.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button 
                onClick={handleLaunchDemo}
                size="lg"
                variant="primary"
                className="w-full sm:w-auto px-6 font-semibold shadow-sm"
                leftIcon={<Sparkles className="h-4 w-4 text-amber-400" />}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Launch Workbench Demo
              </Button>
              <Button 
                onClick={() => navigateTo('/signup')}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 border-zinc-300 text-zinc-800 hover:bg-zinc-100 font-semibold"
              >
                Create Account
              </Button>
            </div>

            {/* System Invariant Checklist */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-500 font-mono">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Zero installation
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Zero spoiler policy
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Real-time vocal telemetry
              </span>
            </div>
          </div>

          {/* Interactive Live Product Stage */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden text-zinc-100">
            {/* Window Topbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-zinc-400">
                  algoOS // runtime-preview // interactive-mode
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab('voice')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    activeTab === 'voice' 
                      ? 'bg-zinc-800 text-white font-semibold' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Mic className="h-3 w-3" /> Voice Reasoning
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ssa')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    activeTab === 'ssa' 
                      ? 'bg-zinc-800 text-white font-semibold' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <MessageSquareCode className="h-3 w-3" /> Socratic SSA
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reverse')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    activeTab === 'reverse' 
                      ? 'bg-zinc-800 text-white font-semibold' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Code2 className="h-3 w-3" /> Reverse Synthesizer
                </button>
              </div>
            </div>

            {/* Interactive Tab 1: Voice Reasoning Console */}
            {activeTab === 'voice' && (
              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-zinc-950">
                {/* Left: Waveform & Speech Stream */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800/80 pb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE AUDIO TELEMETRY STREAM
                    </span>
                    <span className="text-zinc-500">Latency: 42ms</span>
                  </div>

                  {/* Visualizer Waveform Mock */}
                  <div className="h-16 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center px-4 gap-1">
                    {[20, 35, 60, 40, 85, 95, 70, 45, 80, 100, 65, 30, 50, 75, 90, 85, 40, 60, 30, 20, 15, 45, 65, 80, 55, 35, 20, 40, 70, 85, 60, 30].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 rounded-full bg-emerald-400/80 transition-all duration-150"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  {/* Speech transcript breakdown */}
                  <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono text-xs space-y-2.5">
                    <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                      Spoken Reasoning Trace
                    </div>
                    <p className="text-zinc-200 leading-relaxed">
                      "We have 10^5 elements. A brute force nested search gives O(N^2) which will exceed 10^8 operations. 
                      <span className="bg-amber-950/70 border border-amber-800/80 text-amber-300 px-1 py-0.5 rounded mx-1">
                        [Pause: 2.1s hesitation]
                      </span>
                      If we instead maintain a monotonic decreasing stack, every element gets pushed once and popped at most once. That guarantees strict O(N) linear time."
                    </p>
                  </div>
                </div>

                {/* Right: Cognitive Telemetry Diagnostics */}
                <div className="lg:col-span-5 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 space-y-3 font-sans text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-800 pb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                      <Activity className="h-3.5 w-3.5 text-blue-400" />
                      COGNITIVE FRICTION ANALYSIS
                    </span>
                    <span className="text-emerald-400 font-mono">Score: 9.4 / 10</span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                      <div className="text-zinc-400">Verbal Fluency Index</div>
                      <div className="text-zinc-100 font-bold text-sm mt-0.5">142 words/min <span className="text-emerald-400 text-xs font-normal">(Optimal velocity)</span></div>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                      <div className="text-zinc-400">Detected Hesitation Point</div>
                      <div className="text-amber-300 font-semibold mt-0.5">2.1s at Time Complexity Tradeoff</div>
                      <div className="text-zinc-500 text-[10px] mt-0.5">Learner paused before transitioning from O(N^2) to Stack Invariant.</div>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                      <div className="text-zinc-400">Socratic Coach Assessment</div>
                      <div className="text-emerald-300 font-semibold mt-0.5">Optimal Invariant Inferred</div>
                      <div className="text-zinc-400 text-[10px] mt-0.5">Amortized O(N) linear proof verified. Ready for dry run.</div>
                    </div>
                  </div>

                  <Button
                    onClick={handleLaunchDemo}
                    size="sm"
                    variant="primary"
                    className="w-full mt-2"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    Open Live Voice Console
                  </Button>
                </div>
              </div>
            )}

            {/* Interactive Tab 2: Socratic SSA 5-Stage Coach */}
            {activeTab === 'ssa' && (
              <div className="p-6 md:p-8 bg-zinc-950 space-y-6">
                {/* 5-Stage Step Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ssaStages.map((stage, idx) => {
                    const isSelected = activeSsaStage === idx;
                    return (
                      <button
                        key={stage.num}
                        type="button"
                        onClick={() => setActiveSsaStage(idx)}
                        className={`p-3 text-left rounded-lg border transition-all text-xs font-mono ${
                          isSelected
                            ? 'bg-zinc-800 border-zinc-600 text-white shadow-sm'
                            : 'bg-zinc-900 border-zinc-800/80 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold text-zinc-500">
                          Stage 0{stage.num}
                        </div>
                        <div className="font-semibold mt-0.5 text-zinc-200">{stage.name}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Stage Simulation Dialogue */}
                <div className="p-5 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-4 text-xs font-sans">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 text-zinc-400 font-mono text-[11px]">
                    <span className="font-semibold text-zinc-300">
                      STAGE {activeSsaStage + 1}: {ssaStages[activeSsaStage].role.toUpperCase()}
                    </span>
                    <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px]">
                      SOCRATIC VERIFIER ACTIVE
                    </span>
                  </div>

                  {/* Learner Speech/Input */}
                  <div className="p-3.5 rounded bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">
                      Learner Formulation
                    </span>
                    <p className="text-zinc-200 text-xs font-mono leading-relaxed">
                      "{ssaStages[activeSsaStage].learner}"
                    </p>
                  </div>

                  {/* Socratic Coach Response (Guaranteed zero spoilers) */}
                  <div className="p-3.5 rounded bg-zinc-850/90 border border-zinc-700/80 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold flex items-center gap-1.5">
                      <Terminal className="h-3 w-3" /> Socratic SSA Coach (Probing Inquiry)
                    </span>
                    <p className="text-zinc-100 text-xs leading-relaxed">
                      "{ssaStages[activeSsaStage].coach}"
                    </p>
                  </div>

                  {/* Validation Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> {ssaStages[activeSsaStage].validation}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSsaStage((prev) => (prev + 1) % ssaStages.length)}
                      className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-sans text-xs"
                    >
                      Next Stage <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Tab 3: Reverse Challenge Mode */}
            {activeTab === 'reverse' && (
              <div className="p-6 md:p-8 bg-zinc-950 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Code Snippet Selector */}
                <div className="lg:col-span-7 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2 text-[11px]">
                    <span>INPUT: SOLUTION IMPLEMENTATION AST</span>
                    <div className="flex gap-1.5">
                      {reverseExamples.map((ex, i) => (
                        <button
                          key={ex.name}
                          type="button"
                          onClick={() => setSelectedReverseCode(i)}
                          className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                            selectedReverseCode === i
                              ? 'bg-zinc-800 text-white font-semibold'
                              : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {ex.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <pre className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 overflow-x-auto text-xs leading-relaxed font-mono">
                    {reverseExamples[selectedReverseCode].code}
                  </pre>
                </div>

                {/* Right: Inferred Problem & Invariants */}
                <div className="lg:col-span-5 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 space-y-3 font-sans text-xs">
                  <div className="border-b border-zinc-800 pb-2 text-[11px] font-mono text-zinc-400">
                    DEDUCED PROBLEM STATEMENT
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {reverseExamples[selectedReverseCode].deducedTitle}
                    </h4>
                    <span className="inline-block px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-zinc-700">
                      Pattern: {reverseExamples[selectedReverseCode].inferredPattern}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-800 font-mono text-[11px]">
                    <div className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                      Synthesized Invariants & Constraints:
                    </div>
                    {reverseExamples[selectedReverseCode].inferredConstraints.map((c, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-zinc-300">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800 font-mono text-[11px]">
                    <div className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                      Required Edge Cases:
                    </div>
                    {reverseExamples[selectedReverseCode].edgeCases.map((ec, i) => (
                      <div key={i} className="text-zinc-400 text-[10px]">
                        → {ec}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleLaunchDemo}
                    size="sm"
                    variant="primary"
                    className="w-full mt-2"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  >
                    Solve in Reverse Mode
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Engineering Pillars: How the Cognitive Loop Works */}
      <section className="py-16 md:py-24 border-b border-zinc-200/80 bg-zinc-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mb-3">
              Built on Metacognitive Principles
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              AlgoMind replaces rote problem memorization with rigorous cognitive telemetry and Socratic deduction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white border border-zinc-200/90 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 font-mono">
                <Mic className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-950">1. Think-Aloud Telemetry</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Vocalizing code logic reveals pauses where your mental model fractures. The system measures hesitation latency to spot weak intuition before syntax is typed.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-zinc-200/90 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 font-mono">
                <MessageSquareCode className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-950">2. Socratic Verification</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Zero solutions are fed directly. The AI asks targeted constraint questions that compel you to deduce loop invariants, optimal bounds, and edge scenarios yourself.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-zinc-200/90 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 font-mono">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-950">3. Reverse Problem Synthesis</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Working backwards from code implementations forces your mind to see problems as mathematical constraints that demand specific data structures.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-zinc-200/90 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 font-mono">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-950">4. Spaced Recall Cadence</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Every attempt feeds a forgetting-curve scheduler. Problems resurface at optimal decay intervals so algorithms transition into permanent reflexive knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Rote Grinding vs Architectural Reasoning */}
      <section className="py-16 md:py-24 border-b border-zinc-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mb-3">
              Rote Grinding vs. Architectural Reasoning
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Why engineers who solve 500 problems still struggle in live interviews, and how structural deduction fixes it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 space-y-4">
              <div className="text-xs font-mono font-bold uppercase text-rose-700 dark:text-rose-400 tracking-wider">
                Traditional Rote Grinding
              </div>
              <ul className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Memorizing individual solutions without extracting transferable invariants.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Silent coding leading to frozen hesitation during real technical interviews.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Peeking at solution tabs immediately when stuck, destroying metacognitive retention.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Complete failure when interviewers modify or invert a single problem constraint.</span>
                </li>
              </ul>
            </div>

            {/* The AlgoMind Way */}
            <div className="p-6 rounded-xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-4">
              <div className="text-xs font-mono font-bold uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">
                AlgoMind Cognitive Workbench
              </div>
              <ul className="space-y-3 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Vocalized problem decomposition with live AI hesitation and friction analysis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>5-stage Socratic coaching that forces you to prove loop invariants before code.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Strict zero-spoiler policy: guiding questions instead of spoon-fed answers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                  <span>Spaced repetition telemetry resurfacing concepts right before memory decay.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-zinc-50/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
            Elevate Your Algorithmic Problem Solving
          </h2>
          <p className="text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Experience the difference of structured vocal reasoning, zero-spoiler guidance, and invariant-first problem deconstruction.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button 
              onClick={handleLaunchDemo}
              size="lg"
              variant="primary"
              className="px-8 font-semibold shadow-sm"
              leftIcon={<Sparkles className="h-4 w-4 text-amber-400" />}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Start Instant Live Demo
            </Button>
            <Button 
              onClick={() => navigateTo('/signup')}
              variant="outline"
              size="lg"
              className="border-zinc-300 text-zinc-900 hover:bg-white font-semibold"
            >
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Minimal Engineering Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-8 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono text-zinc-700">
            <span className="font-bold text-zinc-950">&gt;_ algoOS</span>
            <span className="text-zinc-400">//</span>
            <span>Architectural Reasoning Workbench</span>
          </div>
          <div className="text-zinc-400 text-center sm:text-right font-mono text-[11px]">
            &copy; {new Date().getFullYear()} AlgoMind. Zero-spoiler cognitive engineering runtime.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

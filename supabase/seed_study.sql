-- ============================================================================
-- LifeOS — Study track seed (replaces the SDE + FDE tracks)
-- Source: Master_Roadmap.md ("The Complete, Self-Contained Switch Plan")
-- Run AFTER 0001_init.sql and after the single auth user exists.
-- Mapping (locked 2026-07-06):
--   - Each roadmap Block (1–15) = one navigable phase page; Phase 4 and
--     Phase 5 are the final two pages (17 pages total). All static scope.
--   - Bold groups inside a block (DSA / Core CS / OYR / Job / …) = sections.
--   - Every '- [ ]' line = one track_item; each block's ✅ exit check = a
--     final item in an 'Exit check' section.
--   - Duplicated appendix tasks (Project A1/A2 days, AI-theory evenings)
--     are materialized ONCE, in the block that schedules them.
--   - Pinned panels: 'DSA Maintenance' (Phase-2 pattern lists) and
--     'Projects A1 & A2' (Appendix A deep-dive bars only — build tasks
--     live in Blocks 7–11 and 13).
--   - Appendix D (weekly review) is intentionally NOT seeded (no weekly
--     panel was chosen for Study).
-- Deletes the old sde/fde tracks first (cascades phases/sections/items/
-- completions/hours). Gym, Diet, todos and daily_logs are untouched.
-- ============================================================================

do $do$
declare
  v_user uuid;
  study uuid;
  ph  uuid;   -- current phase
  sec uuid;   -- current section
begin
  -- ---- resolve the single user & guard ----
  select id into v_user from auth.users order by created_at limit 1;
  if v_user is null then
    raise exception 'No auth user found — create the account before seeding.';
  end if;
  if exists (select 1 from public.tracks where user_id = v_user and slug = 'study') then
    raise exception 'Study track already exists — seed has already run. Aborting.';
  end if;

  -- ---- remove the retired SDE + FDE tracks (cascades everything under them) ----
  delete from public.tracks where user_id = v_user and slug in ('sde', 'fde');

  -- ---- keep the dashboard tile order tidy: Study 1 · Gym 2 · Diet 3 ----
  update public.tracks set sort_order = 2 where user_id = v_user and slug = 'gym';
  update public.tracks set sort_order = 3 where user_id = v_user and slug = 'diet';

  -- ================================================================
  -- TRACK · STUDY  (phased, hours)
  -- ================================================================
  insert into public.tracks (user_id, slug, name, layout, tracks_hours, source_doc, icon, color, accent, sort_order)
  values (v_user, 'study', 'Study', 'phased', true, 'Master_Roadmap.md', 'graduation-cap', '#6366F1', '#8B5CF6', 1)
  returning id into study;

  -- ================================================================
  -- Block 1
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 1 — Arrays/Hashing/Two-Pointers · OS Concurrency · Go Concurrency', 'Phase 1 — Rebuild the Gate', 'phase', 'static', 0)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'DSA — Arrays & Hashing → Two Pointers (https://neetcode.io/practice)', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Two Sum', 0),
    ('Valid Anagram', 1),
    ('Group Anagrams', 2),
    ('Top K Frequent Elements', 3),
    ('Product of Array Except Self', 4),
    ('Valid Sudoku', 5),
    ('Encode and Decode Strings', 6),
    ('Longest Consecutive Sequence', 7),
    ('Valid Palindrome', 8),
    ('Two Sum II (sorted)', 9),
    ('3Sum', 10),
    ('Container With Most Water', 11),
    ('Trapping Rain Water (hard)', 12)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Core CS — OS: Processes + Concurrency — OSTEP (https://pages.cs.wisc.edu/~remzi/OSTEP/)', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Ch 4 — The Abstraction: The Process (§4.1–4.6 — process API, creation, states, the PCB)', 0),
    ('Ch 6 — Limited Direct Execution (§6.1–6.5 — restricted ops, the context switch)', 1),
    ('Ch 26 — Concurrency: An Introduction (§26.1–26.7 — threads, race conditions, critical section)', 2),
    ('Ch 28 — Locks / mutex (§28.1–28.4 + §28.17 — skip the hardware detail §28.5–28.16)', 3),
    ('Ch 30 — Condition Variables (§30.1–30.4 — producer/consumer, covering conditions)', 4),
    ('Ch 31 — Semaphores (§31.1–31.4 + §31.8 — binary semaphores, ordering, producer/consumer)', 5),
    ('Ch 32 — Common Concurrency Problems (§32.1–32.4 — bug types, deadlock + the 4 Coffman conditions)', 6),
    ('Banker''s Algorithm (not in OSTEP): GeeksforGeeks (https://www.geeksforgeeks.org/bankers-algorithm-in-operating-system/)', 7),
    ('Burn in the 3 quiz-inverted facts: threads share memory / processes isolated · mutex = acquire→work→release · race → critical section → lock', 8),
    ('Do: producer–consumer with a bounded buffer using mutex + condition variable (C++); then remove the lock and watch it corrupt', 9)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'OYR — Go concurrency: defend your goroutines (https://gobyexample.com/)', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Read & run: Goroutines · Channels · Channel Directions · Select · WaitGroups · Worker Pools · Mutexes (Go by Example)', 0),
    ('Write in your own words: what a goroutine is, how a worker pool bounds concurrency, how channels pass work, what race your mutex prevented — this is exactly what the interviewer will ask', 1)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Job — set up the machine', 3) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Build a referral tracker (sheet: Company | Role | Referrer | Applied date | Status)', 0),
    ('Find 10 BITS alumni at target companies on LinkedIn — map only, don''t message yet', 1)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Exit check', 4) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, '✅ All Block-1 DSA done (revisit list started) · explain thread vs process, mutex, deadlock''s 4 conditions from memory · explain a goroutine worker pool in your own words', 0);

  -- ================================================================
  -- Block 2
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 2 — Sliding Window/Stack/Binary Search/Linked List · DB Theory + SQL · Connection Pooling', 'Phase 1 — Rebuild the Gate', 'phase', 'static', 1)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'DSA — Sliding Window → Stack → Binary Search → Linked List (https://neetcode.io/practice)', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Best Time to Buy and Sell Stock', 0),
    ('Longest Substring Without Repeating Characters', 1),
    ('Longest Repeating Character Replacement', 2),
    ('Minimum Window Substring (hard)', 3),
    ('Valid Parentheses', 4),
    ('Min Stack', 5),
    ('Daily Temperatures', 6),
    ('Car Fleet', 7),
    ('Binary Search', 8),
    ('Search a 2D Matrix', 9),
    ('Koko Eating Bananas', 10),
    ('Search in Rotated Sorted Array', 11),
    ('Time Based Key-Value Store', 12),
    ('Reverse Linked List', 13),
    ('Merge Two Sorted Lists', 14),
    ('LRU Cache — do this carefully: HashMap + doubly-linked list', 15)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Core CS — Databases: theory + SQL querying', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('ACID — write the 4 letters cold: Atomicity, Consistency, Isolation, Durability (not "Concurrency", not "Idempotency")', 0),
    ('Isolation anomalies + levels — dirty / non-repeatable / phantom reads; READ COMMITTED (Postgres default) / REPEATABLE READ / SERIALIZABLE and what each prevents (https://backendbeyond.com/database-transaction-isolation-levels/)', 1),
    ('Normalization 1NF → 2NF → 3NF → BCNF — be able to spot a violation (https://www.geeksforgeeks.org/normal-forms-in-dbms/)', 2),
    ('SQL practice — SQLBolt (https://sqlbolt.com/) for mechanics, then start LeetCode SQL 50: SELECT + JOIN problems this block, 5/set per block, finish all 50 by Block 4 (https://leetcode.com/studyplan/top-sql-50/)', 3)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'OYR — connection pooling: defend your "25 connections"', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Watch one Hussein Nasser connection-pooling video + skim the HikariCP pool-sizing note (https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing)', 0),
    ('Be able to answer: what a connection pool is; why 25 and what breaks at 5 vs 250; is the ceiling max_connections, thread count, or memory; what pool exhaustion looks like', 1)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Job — résumé v1 (softened + re-scoped)', 3) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Rewrite the RCA bullet to what you actually owned: Go microservice, Docker/K8s deployment, topology/graph + candidate-list engine, Grafana viz; integrated a teammate''s scoring model', 0),
    ('Soften the vibe-coded specifics — keep worker-pool / connection pooling / Kafka Streams only in forms you can currently defend (re-strengthen in Blocks 1, 2, 9)', 1),
    ('Lead with Ericsson + the RCA project (above academics); add a GitHub link placeholder; add EXL as current role', 2),
    ('Post the résumé for review (r/cscareerquestionsIndia, a senior, or Claude)', 3)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Exit check', 4) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, '✅ LRU Cache implemented from scratch · ACID + isolation levels + one clean LEFT JOIN from memory · résumé re-scoped so every bullet is currently true · connection-pool answer ready', 0);

  -- ================================================================
  -- Block 3
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 3 — Graphs I (BFS/DFS/Matrix/Topo) · Networking', 'Phase 1 — your real gap begins: watch the NeetCode Graphs pattern videos BEFORE attempting', 'phase', 'static', 2)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'DSA — Graphs I (pattern videos first: https://www.youtube.com/playlist?list=PLot-Xpze53leOBgcVsJBEGrHPd_7x_koV)', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Number of Islands', 0),
    ('Max Area of Island', 1),
    ('Clone Graph', 2),
    ('Pacific Atlantic Water Flow', 3),
    ('Surrounded Regions', 4),
    ('Rotting Oranges', 5),
    ('Walls and Gates (Islands & Treasure)', 6),
    ('Course Schedule (cycle detection)', 7),
    ('Course Schedule II (topological sort — real dependency graphs, like your RCA topology)', 8),
    ('Graph Valid Tree', 9),
    ('Number of Connected Components in an Undirected Graph', 10)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Core CS — Networking for backend', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('TCP 3-way handshake — every new connection = 1 RTT (this is WHY connection pooling exists); learn TIME_WAIT + ephemeral-port exhaustion (https://www.cloudflare.com/learning/ddos/glossary/three-way-handshake/)', 0),
    ('HTTP/1.1 vs HTTP/2 — multiplexing, streams, header compression, why HTTP/2 kills head-of-line blocking (https://http2-explained.haxx.se/content/en/part1.html ch. 1–4)', 1),
    ('WebSockets vs HTTP — when persistent connections beat request-response (https://ably.com/topic/websockets-vs-http-streaming)', 2),
    ('DNS TTL — why an A-record change doesn''t propagate instantly (matters for blue-green deploys)', 3)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Job', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'Send your first 5 referral messages — short, specific: "BITS ''26, built a Go RCA microservice at Ericsson, would you refer me for role X?"', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Exit check', 3) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, '✅ Solve an unseen matrix-BFS/DFS problem unaided · draw + explain the TCP handshake and the HTTP/1.1-vs-2 difference from memory', 0);

  -- ================================================================
  -- Block 4
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 4 — Graphs II (Union-Find/Dijkstra/MST) · Indexing + Finish SQL · RCA OYR', 'Phase 1 — Rebuild the Gate', 'phase', 'static', 3)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'DSA — Graphs II', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Redundant Connection (Union-Find / DSU)', 0),
    ('Number of Connected Components — re-solve using DSU', 1),
    ('Accounts Merge', 2),
    ('Network Delay Time (Dijkstra — implement the min-heap version yourself)', 3),
    ('Cheapest Flights Within K Stops', 4),
    ('Min Cost to Connect All Points (MST)', 5),
    ('Swim in Rising Water', 6),
    ('Word Ladder', 7),
    ('Alien Dictionary (hard topological sort)', 8),
    ('Reconstruct Itinerary', 9)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Core CS — Indexing + finish SQL', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Indexing — index your read patterns, not your columns; B-tree vs LSM-tree intuition; covering index (https://www.freecodecamp.org/news/how-database-indexes-work-a-practical-guide-with-postgresql-examples)', 0),
    ('Finish LeetCode SQL 50 — aggregation (GROUP BY/HAVING), subqueries, window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM/AVG OVER); LEFT JOIN + GROUP BY without thinking (https://mode.com/sql-tutorial/sql-window-functions/)', 1)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'OYR — RCA topology/graph engine: defend your real work loudly', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Write crisp answers: the two data sources (kube_pod_info / kube_node_info labels; Prometheus for cluster/VM tiers); how the graph is built + represented; what fan-out and hops control; where it breaks at scale — practice saying it precisely', 0),
    ('Honest validation answer ready: "v1 — validation was limited; if I redid it I''d measure precision of the ranked root cause against known incidents"', 1)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Job', 3) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'Map 10 more alumni; send 5 more messages (10 sent total)', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Exit check', 4) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, '✅ Implement Dijkstra and Union-Find from scratch · all 50 SQL done · narrate your RCA graph engine in precise language, honestly attributing the scoring to your teammate', 0);

  -- ================================================================
  -- Block 5
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 5 — DP I (1-D + Knapsack) · OOP/SOLID/Patterns', 'Phase 1 — watch the NeetCode DP pattern videos first', 'phase', 'static', 4)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'DSA — 1-D DP & knapsack (pattern videos first: https://www.youtube.com/playlist?list=PLot-Xpze53lcvx_tjrr_m2lgD2NsRHlNO)', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Climbing Stairs', 0),
    ('Min Cost Climbing Stairs', 1),
    ('House Robber', 2),
    ('House Robber II', 3),
    ('Longest Palindromic Substring', 4),
    ('Palindromic Substrings', 5),
    ('Decode Ways', 6),
    ('Coin Change', 7),
    ('Maximum Product Subarray', 8),
    ('Word Break', 9),
    ('Longest Increasing Subsequence', 10),
    ('Partition Equal Subset Sum (0/1 knapsack)', 11)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Core CS — OOP / SOLID / Design Patterns', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('4 pillars — encapsulation, abstraction, inheritance, polymorphism (one code example each)', 0),
    ('SOLID — each principle in 2 sentences + a violation example (https://refactoring.guru/design-patterns/solid-principles)', 1),
    ('Patterns — Singleton/Factory/Builder (creational) · Adapter/Decorator/Facade (structural) · Observer/Strategy/Command (behavioral); know WHEN to use each (https://refactoring.guru/design-patterns)', 2)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'OYR — C++ finance tracker (your real work)', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'For each pattern you claim (Singleton, Repository, Factory): why it fit HERE + its downside (Singletons hurt testability). "Why Singleton?" WILL be asked', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Job + AI theory', 3) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('One polite nudge to non-responders; 2nd-pass résumé edit from review feedback', 0),
    ('AI theory — evening 1 · LLMs: The Illustrated Transformer (https://jalammar.github.io/illustrated-transformer/) + play with Tiktokenizer; say: what a token is · token count drives cost/latency/context · attention = every token attends to every other', 1)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Exit check', 4) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, '✅ Solve an unseen 1-D DP unaided · state all 5 SOLID principles + a violation each from memory · defend each design pattern on your résumé', 0);

  -- ================================================================
  -- Block 6
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 6 — DP II (2-D + Hard) · OS Completion · Consolidation', 'Phase 1 — the Phase-1 gate', 'phase', 'static', 5)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'DSA — 2-D DP & hard', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Unique Paths', 0),
    ('Longest Common Subsequence', 1),
    ('Best Time to Buy/Sell With Cooldown', 2),
    ('Coin Change II', 3),
    ('Target Sum', 4),
    ('Interleaving String', 5),
    ('Edit Distance (the canonical 2-D DP — understand it fully)', 6),
    ('Distinct Subsequences', 7),
    ('Burst Balloons (hard)', 8),
    ('Revisit your 3 worst DP misses', 9)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Core CS — finish OS — OSTEP (https://pages.cs.wisc.edu/~remzi/OSTEP/)', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Scheduling — Ch 7 (FCFS/FIFO, SJF, STCF/SRTF, Round Robin, response vs turnaround, I/O) + Ch 8 MLFQ (§8.1–8.4, 8.6); Gantt-chart + avg-waiting-time numericals via Gate Smashers (https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p)', 0),
    ('Memory — Ch 13 Address Spaces · Ch 16 Segmentation · Ch 18 Paging · Ch 19 TLBs · Ch 21 Swapping · Ch 22 Page replacement (FIFO/LRU/Optimal)', 1),
    ('I/O & Disk — Ch 36 I/O Devices · Ch 37 HDDs (disk scheduling: FCFS, SSTF, SCAN, C-SCAN)', 2)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Consolidation + OYR self-test (Phase-1 gate)', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('On paper, from memory: ACID · TCP handshake · mutex vs semaphore · 5 SOLID principles · B-tree indexing · goroutine worker pool — any blank → reread that source same day', 0),
    ('Have someone (or Claude) fire 3 follow-ups per résumé bullet — anything you still can''t defend → soften/cut now', 1),
    ('AI theory — evening 2 · LLM controls: temperature/top-p · long-context tradeoff · hallucination = confidently stated factually-wrong claims · RLHF makes a base model follow instructions (https://docs.anthropic.com/en/docs/intro-to-claude)', 2),
    ('AI theory — evening 3a · Embeddings: meaning → a vector in semantic space · cosine similarity = angle between vectors · why semantic search beats keyword (https://cohere.com/llmu/text-embeddings)', 3),
    ('AI theory — evening 3b · RAG vs fine-tuning, verbatim: "Prompt first → RAG when the model needs to KNOW things → fine-tune only to change behavior/format/style, never to inject facts" (https://www.pinecone.io/learn/retrieval-augmented-generation/)', 4),
    ('Optional (spare energy): one LLD problem — Parking Lot or Rate Limiter (https://github.com/ashishps1/awesome-low-level-design)', 5)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Exit check', 3) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, '✅ Phase-1 exit: fresh DP/graph medium ≤30 min + explained aloud · all listed fundamentals re-derivable from memory · résumé fully defendable + reviewed · 15+ contacts / 10+ messages · AI theory done', 0);

  -- ================================================================
  -- Block 7
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 7 — APIs, Contracts, Idempotency · Start Project A1', 'Phase 2 — Backend Depth + Project A1 · DSA is now maintenance (pinned panel), 2–3/day', 'phase', 'static', 6)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Backend study', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('The Twelve-Factor App — read all 12; write one sentence per factor in your own words (https://12factor.net/)', 0),
    ('REST vs gRPC vs GraphQL — memorize the decision rules: REST = public/cacheable · gRPC = internal typed/binary · GraphQL = client picks the shape (https://konghq.com/blog/engineering/rest-vs-grpc-vs-graphql)', 1),
    ('API design + versioning + pagination — Zalando guidelines (Principles, Resources, Compatibility, Pagination) + Speakeasy versioning; know cursor vs offset and why cursor wins at scale (https://opensource.zalando.com/restful-api-guidelines/)', 2),
    ('Idempotency — Brandur idempotency keys (https://brandur.org/idempotency-keys) + AWS Builders'' Library idempotent APIs', 3)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Build — this becomes A1''s backend', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('FastAPI tutorial "First Steps" → "Request Body": build POST /users + GET /users/{id}; add an idempotency key on the POST (https://fastapi.tiangolo.com/tutorial/)', 0),
    ('Project A1 — Day 1: corpus of 20–50 docs (runbooks, postmortems, K8s guides, your RCA notes) → load → chunk (~500 tokens, 50 overlap) → embed → store vectors + metadata in pgvector (https://python.langchain.com/docs/tutorials/rag/)', 1)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'System design', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'System Design Primer intro; write the 7-step framework on a card: requirements → estimation → API → data model → high-level design → deep-dive → bottlenecks (https://github.com/donnemartin/system-design-primer)', 0);

  -- ================================================================
  -- Block 8
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 8 — DB Internals + Caching · A1 Retrieval · SysD Mock #1', 'Phase 2 — Backend Depth + Project A1', 'phase', 'static', 7)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Backend study', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Transactions / locking / MVCC — the lost-update phenomenon (https://vladmihalcea.com/a-beginners-guide-to-database-locking-and-the-lost-update-phenomena/)', 0),
    ('DB selection — Postgres vs Mongo/Dynamo vs Cassandra vs Redis use-case matrix (https://www.integrate.io/blog/which-database/)', 1),
    ('Caching — Redis: cache-aside pattern, TTLs, why Redis isn''t your primary DB (https://redis.io/docs/about/)', 2),
    ('N+1 query problem — then trigger and fix one in your FastAPI app with SQL logging on (https://blog.appsignal.com/2020/06/09/n-plus-one-queries-explained.html)', 3)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Build', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'Project A1 — Day 2: query → embed → cosine top-k from pgvector → grounded prompt ("answer only from context; if absent, say you don''t know") → answer with citations; wrap as POST /ask + thin UI', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'System design', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'Mock #1 (timed 45 min): Design a URL shortener — base62, DB + cache, read/write path; record yourself, score against the Primer exercise, debrief', 0);

  -- ================================================================
  -- Block 9
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 9 — Messaging & Kafka (defend your résumé) · A1 Measure · SysD Mock #2 · Go Live', 'Phase 2 — Backend Depth + Project A1', 'phase', 'static', 8)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Backend study — Kafka for real (your résumé claim)', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Kafka intro (https://kafka.apache.org/intro) + Hussein Nasser deep-dives: partitions, consumer groups, offsets, delivery semantics (at-most/at-least/exactly-once), rebalancing, log compaction → upgrade your Ericsson OYR answers + re-strengthen the résumé Kafka bullet honestly', 0),
    ('Event-driven patterns — Choreography vs Orchestration (https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography)', 1)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Build', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'Project A1 — Day 3 (measure): 10–15 question/expected pairs; score retrieval + faithfulness with RAGAS (https://docs.ragas.io/en/stable/); improve ONE thing (chunking / hybrid search / reranker); record before/after numbers', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'System design', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'Mock #2: Design a rate limiter (token bucket + sliding window)', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Job — go live on project-weighted roles (soft)', 3) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, '5 referral-backed applications to AI-first startups / remote-global startups / experience-probing backend roles; log every response', 0);

  -- ================================================================
  -- Block 10
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 10 — Distributed Systems Fundamentals · SysD Mock #3 · Apply', 'Phase 2 — Backend Depth + Project A1', 'phase', 'static', 9)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Backend study', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('CAP, consistency, partitioning/sharding, consistent hashing, replication — System Design Primer topics + ByteByteGo ("consistent hashing", "data replication") (https://github.com/donnemartin/system-design-primer#index-of-system-design-topics)', 0),
    ('Resilience patterns — retries, timeouts, exponential backoff, circuit breaker, idempotent retries', 1)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'System design', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'Mock #3: Design a news feed / Twitter timeline (fan-out on write vs read)', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Job', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, '5–8 referral-backed applications; keep the tracker current', 0);

  -- ================================================================
  -- Block 11
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 11 — Reliability/SRE · Ship A1 · SysD Mock #4', 'Phase 2 — Backend Depth + Project A1 · the Phase-2 gate', 'phase', 'static', 10)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Backend study', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'SLI/SLO/SLA, observability (metrics/logs/traces), graceful degradation — skim Google SRE Book SLO chapter; ties to your Grafana/Prometheus résumé line (https://sre.google/sre-book/service-level-objectives/)', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Build', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'Project A1 — Day 4 (ship): deploy (Render/Railway/Fly); 1-page README (problem, architecture, eval before/after, "what I''d do at scale"); push to GitHub; add the link to your résumé', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'System design', 2) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, 'Mock #4: Design a chat system / WhatsApp (WebSockets, presence, delivery)', 0);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'Exit check', 3) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  values (v_user, study, ph, sec, '✅ Phase-2 exit: defend your backend + RCA end-to-end · 4 SysD mocks done · A1 live and on résumé · 15+ applications out', 0);

  -- ================================================================
  -- Block 12
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 12 — SysD: Caching/CDN/Read-Scaling · Open DSA-Gated Applications', 'Phase 3 — System Design Depth · DSA 2/day, emphasis on explaining aloud', 'phase', 'static', 11)
  returning id into ph;

  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, null::uuid, t.title, t.ord from (values
    ('Study: caching layers, CDN, read replicas, DB scaling (https://github.com/donnemartin/system-design-primer)', 0),
    ('Mock #5: Design a web crawler', 1),
    ('Job — open the DSA-gated tier (FAANG-India, big unicorns) now that DSA is ready; move to 8–10 applications/week ongoing', 2)
  ) t(title, ord);

  -- ================================================================
  -- Block 13
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 13 — SysD: Storage + AI Design · Project A2 · AI Interview Prep', 'Phase 3 — System Design Depth', 'phase', 'static', 12)
  returning id into ph;

  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, null::uuid, t.title, t.ord from (values
    ('Mock #6: Design a typeahead/autocomplete (Trie + ranking — ties to your Tries DSA)', 0),
    ('Mock #7: Design a RAG assistant for a regulated enterprise (grounding, vector store, eval, guardrails) — your differentiator round', 1),
    ('AI-engineer interview essentials — RAG vs fine-tune vs prompt ladder · evals = your A1 before/after numbers (https://hamel.dev/blog/posts/evals/) · hallucination mitigation · prompt injection + 1 mitigation (https://genai.owasp.org/llm-top-10/) · cost/latency/quality triangle · the "deliberately SKIPPED" answers', 2),
    ('Project A2 — Day 1: read Building Effective Agents first (ReAct: reason→act→observe; failure modes + bounds) (https://www.anthropic.com/research/building-effective-agents); define 2–3 tools with JSON schemas (public API + calculator + "search my A1 RAG"); single-step correct tool + valid args', 3),
    ('Project A2 — Day 2: ReAct loop (model calls tool → execute → feed back → repeat) + max-step bound + arg validation; compose with A1; README + GitHub + résumé link', 4)
  ) t(title, ord);

  -- ================================================================
  -- Block 14
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 14 — SysD: Geo-Distributed · Behavioral Kickoff', 'Phase 3 — System Design Depth', 'phase', 'static', 13)
  returning id into ph;

  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, null::uuid, t.title, t.ord from (values
    ('Mock #8: Design a ride-sharing / location system (geo-hashing, WebSockets — ties to your DHT research project)', 0),
    ('Start writing/rehearsing STAR stories daily (see Phase 4)', 1)
  ) t(title, ord);

  -- ================================================================
  -- Block 15
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Block 15 — SysD Consolidation + Portfolio Polish', 'Phase 3 — the Phase-3 gate', 'phase', 'static', 14)
  returning id into ph;

  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, null::uuid, t.title, t.ord from (values
    ('Mocks #9 & #10: redo your two worst-scored designs, cold', 0),
    ('Polish both project READMEs + GitHub; confirm the portfolio link is on the résumé', 1),
    ('✅ Phase-3 exit: 10 SD mocks total · 5 STAR stories drafted · both AI projects on résumé', 2)
  ) t(title, ord);

  -- ================================================================
  -- Phase 4 — Interview Loops + Behavioral
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Phase 4 — Interview Loops + Behavioral', 'Blocks 13–18, overlapping — run many loops in parallel; offers cluster, you want competing offers', 'phase', 'static', 15)
  returning id into ph;

  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, null::uuid, t.title, t.ord from (values
    ('Behavioral (daily 20–30 min): write + rehearse 5 STAR stories from real material — (1) an incident/bug you owned (Ericsson) · (2) pushing back on a bad requirement · (3) a failed project / corrected call · (4) explaining tech to non-technical people (DigiBunai) · (5) working with incomplete info (https://www.techinterviewhandbook.org/behavioral-interview/)', 0),
    ('Per-company 1-pager: what they sell, to whom, why you, 3 reasons; read their eng blog; pull interview reports from Levels.fyi, Glassdoor, LeetCode Discuss', 1),
    ('Weekly full mock loop (DSA + SD + behavioral) with a peer or Pramp (https://www.pramp.com/); rehearse the résumé deep-dive HARDEST — your highest-risk round; lead AI answers with what you shipped and measured', 2)
  ) t(title, ord);

  -- ================================================================
  -- Phase 5 — Negotiate & Close
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Phase 5 — Negotiate & Close', 'Blocks 17–20+ — you are employed: be patient, be selective, resign only after signing', 'phase', 'static', 16)
  returning id into ph;

  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, null::uuid, t.title, t.ord from (values
    ('Stagger applications so offers overlap; slow-walk early offers (politely ask for time) while faster pipelines catch up', 0),
    ('Never accept on the spot — anchor with competing offers + your EXL base', 1),
    ('Evaluate TC honestly: base vs equity vs joining bonus; startups → funding stage, runway, last valuation, ESOP strike + liquidity', 2),
    ('Resign EXL only after signing; serve notice cleanly — keep them as a reference', 3)
  ) t(title, ord);

  -- ================================================================
  -- PINNED · DSA Maintenance (Phase 2+ patterns — always visible)
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'DSA Maintenance', '2–3/day from Phase 2 on — think 15–20 min → plain-English approach → C++ → debug yourself → NeetCode solution; misses go on the revisit list, redo after 3 days', 'pinned', 'static', 17)
  returning id into ph;

  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, null::uuid, t.title, t.ord from (values
    ('Heap/PQ: Kth Largest in a Stream · Last Stone Weight · K Closest Points to Origin · Task Scheduler · Find Median from Data Stream', 0),
    ('Tries: Implement Trie · Design Add and Search Words · Word Search II', 1),
    ('Intervals: Insert Interval · Merge Intervals · Non-overlapping Intervals · Meeting Rooms I · Meeting Rooms II', 2),
    ('Greedy: Maximum Subarray · Jump Game · Jump Game II · Gas Station · Hand of Straights', 3),
    ('Backtracking: Subsets · Combination Sum · Permutations · Word Search · Palindrome Partitioning · N-Queens', 4)
  ) t(title, ord);

  -- ================================================================
  -- PINNED · Projects A1 & A2 (Appendix A deep-dive bars — build tasks
  -- live in Blocks 7–11 and 13; tick these when you can defend them aloud)
  -- ================================================================
  insert into public.track_phases (user_id, track_id, title, subtitle, layout, period_scope, sort_order)
  values (v_user, study, 'Projects A1 & A2', 'Deep-dive bars — the build days live in Blocks 7–11 & 13; tick each line when you can say it aloud, unprompted', 'pinned', 'static', 18)
  returning id into ph;

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'A1 — RAG-RCA Assistant (FastAPI · pgvector · LLM API)', 0) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('Say the pipeline in one breath: load → chunk → embed → store → retrieve → rerank → generate', 0),
    ('Why RAG, not fine-tuning, here', 1),
    ('Your chunking choice + its failure mode', 2),
    ('How you measured quality + what moved it (the before/after numbers)', 3),
    ('Where it breaks at scale: top-k latency at 10M vectors → HNSW/IVF indexes · embedding cost · stale docs', 4),
    ('When you''d switch pgvector → Pinecone/Weaviate (the senior nuance)', 5)
  ) t(title, ord);

  insert into public.track_sections (user_id, track_id, phase_id, title, sort_order)
  values (v_user, study, ph, 'A2 — Function-Calling Agent', 1) returning id into sec;
  insert into public.track_items (user_id, track_id, phase_id, section_id, title, sort_order)
  select v_user, study, ph, sec, t.title, t.ord from (values
    ('The ReAct loop + where it runs away (infinite loops, wrong tool, hallucinated args)', 0),
    ('Why you capped steps + validated args', 1),
    ('When an agent is overkill vs a simple RAG call — judgment, not hype', 2)
  ) t(title, ord);

end
$do$;

# Master Roadmap — The Complete, Self-Contained Switch Plan
> **One file. Everything you need is inside it — no other file required.** Work through the blocks in order; tick every box. Pace is yours (you chose flexible), so a "Block" is a unit of work, not a calendar week — finish one, start the next.
> **Yuvraj** · EXL ₹18L → product/AI role **₹40L+ TC** · part-time around your job · Updated 2026-07-01.

---

## THE CONTRACT (read once, then obey)
1. **You are employed. Do not quit until a better offer is signed.** EXL = runway + leverage. Be patient, be selective.
2. **DSA is the critical path.** ~80 problems, basics only, **DP/graphs skipped, cold since Jan.** Until fixed you fail coding rounds regardless of everything else. Blocks 1–6 are non-negotiable.
3. **Your resume is real but heavily vibe-coded.** You own *architecture*; the *code/infra layer (goroutines, connection pooling, Kafka) you cannot currently defend*, and the RCA **scoring was a teammate's work**. The OYR (Own-Your-Resume) tasks fix this by (a) softening claims to honest versions now and (b) learning the code layer for real. **An undefendable résumé is worse than a modest one.**
4. **CGPA 7.21 → referrals are mandatory.** They route you around CGPA auto-filters. Networking starts in Block 1.
5. **One engine.** SDE ~75% (the spine). AI ~25% (2 portfolio projects + enough theory to defend them). No 60/40 blend, no full AI curriculum.
6. **You interview for SDE-1 / SDE-2, not "senior."** Depth to the gate, not architecture vanity.
7. **Your identity = AI-native builder who backs the build with depth.** Marketable in 2026 *if* you close the depth gap.

## HOW TO USE THIS FILE
- Each **Block** = a checklist. Do the boxes top-to-bottom. Don't start the next block until the current one's ✅ **Exit check** passes.
- **DSA every study session, without exception.** Method for *every* problem: think 15–20 min → write the approach in plain English → code in **C++** → run & debug yourself → *only then* read the [NeetCode solution](https://neetcode.io/practice) → watch the [NeetCode video](https://www.youtube.com/@NeetCode) only if still stuck → any problem you missed or needed a hint on goes on a **"revisit" list**, redo it after 3 days.
- **OYR** = go learn/verify the truth behind a résumé bullet until you can survive 3 follow-ups on it. **Job** = résumé/referral/application actions.
- Links are inline on every task. A consolidated index is in **Appendix C**.

---

# PHASE 1 — REBUILD THE GATE (Blocks 1–6)
**Phase exit:** solve a fresh graph/DP medium in ≤30 min and explain it aloud · re-derive ACID, TCP handshake, mutex, SOLID from memory · résumé v1 softened + re-scoped + reviewed · 15+ referral contacts, 10+ messages sent · AI theory done.

## Block 1 — Arrays/Hashing/Two-Pointers · OS concurrency · Go concurrency (defend your goroutines)
**DSA — Arrays & Hashing → Two Pointers ([NeetCode](https://neetcode.io/practice)):**
- [ ] Two Sum
- [ ] Valid Anagram
- [ ] Group Anagrams
- [ ] Top K Frequent Elements
- [ ] Product of Array Except Self
- [ ] Valid Sudoku
- [ ] Encode and Decode Strings
- [ ] Longest Consecutive Sequence
- [ ] Valid Palindrome
- [ ] Two Sum II (sorted)
- [ ] 3Sum
- [ ] Container With Most Water
- [ ] Trapping Rain Water (hard)

**Core CS — Operating Systems: Processes + Concurrency** (free book: [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/)). Read exactly these:
- [ ] **Ch 4 — The Abstraction: The Process** (§4.1 the abstraction, §4.2 process API, §4.3 process creation, §4.4 process states, §4.5 data structures = the **PCB**, §4.6 summary)
- [ ] **Ch 6 — Limited Direct Execution** (§6.1 basic technique, §6.2 restricted operations, §6.3 switching between processes = **context switch**, §6.4 concurrency, §6.5 summary)
- [ ] **Ch 26 — Concurrency: An Introduction** (§26.1 why threads, §26.2 thread creation, §26.3 shared data = **race conditions**, §26.4 uncontrolled scheduling, §26.5 atomicity = **critical section**, §26.6 waiting, §26.7 summary)
- [ ] **Ch 28 — Locks / mutex** (§28.1 the basic idea, §28.2 pthread locks, §28.3 building a lock, §28.4 evaluating locks, §28.17 summary — *skip §28.5–28.16 hardware detail*)
- [ ] **Ch 30 — Condition Variables** (§30.1 definition, §30.2 producer/consumer, §30.3 covering conditions, §30.4 summary)
- [ ] **Ch 31 — Semaphores** (§31.1 definition, §31.2 binary semaphores, §31.3 semaphores for ordering, §31.4 producer/consumer, §31.8 summary)
- [ ] **Ch 32 — Common Concurrency Problems** (§32.1 bug types, §32.2 non-deadlock bugs, §32.3 **deadlock + the 4 Coffman conditions**, §32.4 summary)
- [ ] **Banker's Algorithm** (not in OSTEP): [GeeksforGeeks — Banker's Algorithm](https://www.geeksforgeeks.org/bankers-algorithm-in-operating-system/)
- [ ] **Burn in the 3 quiz-inverted facts:** threads *share* memory / processes *isolated* · mutex = acquire→work→release (NOT a "last-writer" variable) · race → critical section → lock.
- [ ] **Do:** write a producer–consumer with a bounded buffer using a mutex + condition variable (C++); then remove the lock and watch it corrupt.

**OYR + defend your code — Go concurrency (your "10+ goroutines worker-pool" claim):** you vibe-coded this; learn it for real. [Go by Example](https://gobyexample.com/): read & run
- [ ] [Goroutines](https://gobyexample.com/goroutines) · [Channels](https://gobyexample.com/channels) · [Channel Directions](https://gobyexample.com/channel-directions) · [Select](https://gobyexample.com/select) · [WaitGroups](https://gobyexample.com/waitgroups) · [Worker Pools](https://gobyexample.com/worker-pools) · [Mutexes](https://gobyexample.com/mutexes)
- [ ] Write, in your own words: what a goroutine is, how a worker pool bounds concurrency, how channels pass work, and what race your mutex prevented. **This is exactly what an interviewer will ask about that bullet.**

**Job — set up the machine:**
- [ ] Build a referral tracker (sheet: Company | Role | Referrer | Applied date | Status).
- [ ] Find 10 BITS alumni at target companies on LinkedIn. Map only — don't message yet.

✅ **Exit check:** all Block-1 DSA done (revisit list started) · can explain thread vs process, mutex, deadlock's 4 conditions from memory · can explain a goroutine worker pool in your own words.

## Block 2 — Sliding Window/Stack/Binary Search/Linked List · DB theory + SQL · connection pooling (defend your "25 connections")
**DSA — Sliding Window → Stack → Binary Search → Linked List:**
- [ ] Best Time to Buy and Sell Stock
- [ ] Longest Substring Without Repeating Characters
- [ ] Longest Repeating Character Replacement
- [ ] Minimum Window Substring (hard)
- [ ] Valid Parentheses
- [ ] Min Stack
- [ ] Daily Temperatures
- [ ] Car Fleet
- [ ] Binary Search
- [ ] Search a 2D Matrix
- [ ] Koko Eating Bananas
- [ ] Search in Rotated Sorted Array
- [ ] Time Based Key-Value Store
- [ ] Reverse Linked List
- [ ] Merge Two Sorted Lists
- [ ] **LRU Cache** (do this carefully — HashMap + doubly-linked list)

**Core CS — Databases: theory + SQL querying:**
- [ ] **ACID** — write the 4 letters cold: **A**tomicity, **C**onsistency, **I**solation, **D**urability. (Quiz fix: not "Concurrency", not "Idempotency".)
- [ ] **Isolation anomalies + levels** — [BackendBeyond — Isolation Levels](https://backendbeyond.com/database-transaction-isolation-levels/): dirty read, non-repeatable read, phantom read; and READ COMMITTED (Postgres default) / REPEATABLE READ / SERIALIZABLE — know what each prevents.
- [ ] **Normalization** 1NF → 2NF → 3NF → BCNF: [GeeksforGeeks — Normalization](https://www.geeksforgeeks.org/normal-forms-in-dbms/) — be able to spot a violation.
- [ ] **SQL practice** — [SQLBolt](https://sqlbolt.com/) (interactive) for the mechanics, then start **[LeetCode SQL 50](https://leetcode.com/studyplan/top-sql-50/)**: do the *SELECT* and *JOIN* problems this block (joins are your flagged weakness). Continue 5/set per block; finish all 50 by Block 4. Window functions reference: [Mode SQL — Window Functions](https://mode.com/sql-tutorial/sql-window-functions/).

**OYR + defend your code — connection pooling (your "25 connections" claim):**
- [ ] Read [Hussein Nasser — connection pooling](https://www.youtube.com/results?search_query=hussein+nasser+connection+pooling) (one video) + skim [this pool-sizing note](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing).
- [ ] Be able to answer: what a connection pool is; why 25 and what breaks at 5 vs 250; whether the ceiling is the DB's `max_connections`, your thread count, or memory; what pool *exhaustion* looks like.

**Job — résumé v1 (softened + re-scoped):**
- [ ] Rewrite the RCA bullet to what you actually owned: *"Built the Go microservice, Docker/K8s deployment, the topology/graph + candidate-list engine, and the Grafana visualization; integrated against a teammate's scoring model."* Remove the standalone "scoring algorithms" ownership.
- [ ] **Soften** the vibe-coded specifics for now: keep "worker-pool concurrency" / "connection pooling" / "Kafka Streams" only in forms you can currently defend; you'll re-strengthen them as you learn (Blocks 1, 2, 9).
- [ ] Lead the résumé with Ericsson + the RCA project (above academics). Add a GitHub link placeholder. Add EXL as current role.
- [ ] Post for review (r/cscareerquestionsIndia, a senior, or me).

✅ **Exit check:** LRU Cache implemented from scratch · ACID + isolation levels + one clean LEFT JOIN from memory · résumé re-scoped so every bullet is currently true · connection-pool answer ready.

## Block 3 — GRAPHS part 1 (BFS/DFS/matrix/topo) · Networking
> Your real gap begins. **Watch the [NeetCode Graphs playlist](https://www.youtube.com/playlist?list=PLot-Xpze53leOBgcVsJBEGrHPd_7x_koV) pattern videos *before* attempting** — you're learning, not revising.
**DSA — Graphs I:**
- [ ] Number of Islands
- [ ] Max Area of Island
- [ ] Clone Graph
- [ ] Pacific Atlantic Water Flow
- [ ] Surrounded Regions
- [ ] Rotting Oranges
- [ ] Walls and Gates (Islands & Treasure)
- [ ] **Course Schedule** (cycle detection)
- [ ] **Course Schedule II** (topological sort — real dependency graphs, like your RCA topology)
- [ ] Graph Valid Tree
- [ ] Number of Connected Components in an Undirected Graph

**Core CS — Networking for backend (2 quiz blanks):**
- [ ] **TCP 3-way handshake** — [Cloudflare — three-way handshake](https://www.cloudflare.com/learning/ddos/glossary/three-way-handshake/) + [Cloudflare — TCP/IP](https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/). Internalize: every new connection = **1 RTT** → this is *why* connection pooling exists (ties to Block 2). Learn **TIME_WAIT** and ephemeral-port exhaustion.
- [ ] **HTTP/1.1 vs HTTP/2** — [HTTP/2 Explained, ch. 1–4](https://http2-explained.haxx.se/content/en/part1.html): multiplexing, streams, header compression, and why HTTP/2 kills HTTP/1.1 head-of-line blocking.
- [ ] **WebSockets vs HTTP** — [Ably — WebSockets vs HTTP streaming](https://ably.com/topic/websockets-vs-http-streaming): when persistent connections beat request-response.
- [ ] Learn **DNS TTL** (why an A-record change doesn't propagate instantly — matters for blue-green deploys).

**Job:**
- [ ] Send your first 5 referral messages (short, specific: *"BITS '26, built a Go RCA microservice at Ericsson, would you refer me for role X?"*).

✅ **Exit check:** solve an unseen matrix-BFS/DFS problem unaided · draw + explain the TCP handshake and HTTP/1.1-vs-2 difference from memory.

## Block 4 — GRAPHS part 2 (Union-Find/Dijkstra/MST/advanced) · Indexing + finish SQL · RCA graph-engine OYR
**DSA — Graphs II:**
- [ ] Redundant Connection (Union-Find / DSU)
- [ ] Number of Connected Components — *re-solve using DSU*
- [ ] Accounts Merge
- [ ] Network Delay Time (Dijkstra — implement the min-heap version yourself)
- [ ] Cheapest Flights Within K Stops
- [ ] Min Cost to Connect All Points (MST)
- [ ] Swim in Rising Water
- [ ] Word Ladder
- [ ] Alien Dictionary (hard topological sort)
- [ ] Reconstruct Itinerary

**Core CS — Indexing + finish SQL:**
- [ ] **Indexing** — [FreeCodeCamp — how DB indexes work (Postgres)](https://www.freecodecamp.org/news/how-database-indexes-work-a-practical-guide-with-postgresql-examples). Rule: **index your read patterns, not your columns.** Learn B-tree vs LSM-tree intuition and what a **covering index** is.
- [ ] Finish **LeetCode SQL 50** — the aggregation (GROUP BY / HAVING), subquery, and **window function** problems (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM/AVG OVER). You should now write LEFT JOIN + GROUP BY without thinking.

**OYR — your real work (defend it loudly):** RCA topology/graph engine.
- [ ] Write crisp answers: the two data sources (`kube_pod_info`, `kube_node_info` labels → services/nodes; Prometheus for cluster/VM tiers); how the graph is built and represented; what "neighbors per node" (fan-out) and "hops" actually control; where it would break at scale. Practice saying it *precisely* (last time your wording was loose — "correlation engine", "graph vs hierarchy").
- [ ] Have an honest **validation** answer ready: *"v1 — validation was limited; if I redid it I'd measure precision of the ranked root cause against known incidents."*

**Job:**
- [ ] Map 10 more alumni; send 5 more messages (10 sent total).

✅ **Exit check:** implement Dijkstra and Union-Find from scratch · all 50 SQL done · narrate your RCA graph engine in precise language, and honestly attribute the scoring to your teammate.

## Block 5 — DP part 1 (1D + knapsack) · OOP/SOLID/Patterns
> **Watch the [NeetCode DP playlist](https://www.youtube.com/playlist?list=PLot-Xpze53lcvx_tjrr_m2lgD2NsRHlNO) pattern videos first.**
**DSA — 1-D DP & knapsack:**
- [ ] Climbing Stairs
- [ ] Min Cost Climbing Stairs
- [ ] House Robber
- [ ] House Robber II
- [ ] Longest Palindromic Substring
- [ ] Palindromic Substrings
- [ ] Decode Ways
- [ ] Coin Change
- [ ] Maximum Product Subarray
- [ ] Word Break
- [ ] Longest Increasing Subsequence
- [ ] Partition Equal Subset Sum (0/1 knapsack)

**Core CS — OOP / SOLID / Design Patterns (quiz blank):**
- [ ] **4 pillars** — encapsulation, abstraction, inheritance, polymorphism (one code example each).
- [ ] **SOLID** — [Refactoring Guru — SOLID](https://refactoring.guru/design-patterns/solid-principles): each principle in 2 sentences + a violation example.
- [ ] **Patterns** — [Refactoring Guru — patterns](https://refactoring.guru/design-patterns): Singleton, Factory, Builder (creational); Adapter, Decorator, Facade (structural); Observer, Strategy, Command (behavioral). Know *when* to use each.

**OYR — C++ finance tracker (your real work):**
- [ ] For each pattern you claim (Singleton, Repository, Factory): why it fit *here*, and its downside (Singletons hurt testability — know this). An interviewer *will* ask "why Singleton?".

**Job:**
- [ ] One polite nudge to non-responders; 2nd-pass résumé edit from review feedback.
- [ ] **AI theory — evening 1** (Appendix B, item 1).

✅ **Exit check:** solve an unseen 1-D DP unaided · state all 5 SOLID principles + a violation each from memory · defend each design pattern on your résumé.

## Block 6 — DP part 2 (2D + hard) · OS completion · Consolidation
**DSA — 2-D DP & hard:**
- [ ] Unique Paths
- [ ] Longest Common Subsequence
- [ ] Best Time to Buy/Sell With Cooldown
- [ ] Coin Change II
- [ ] Target Sum
- [ ] Interleaving String
- [ ] **Edit Distance** (the canonical 2-D DP — understand it fully)
- [ ] Distinct Subsequences
- [ ] Burst Balloons (hard)
- [ ] Revisit your 3 worst DP misses

**Core CS — finish OS** (lower priority; matters for companies with core-CS online assessments). [OSTEP](https://pages.cs.wisc.edu/~remzi/OSTEP/):
- [ ] **Scheduling** — Ch 7 (§7.1–7.10: **FCFS/FIFO, SJF, STCF/SRTF, Round Robin, response vs turnaround, I/O**) and Ch 8 MLFQ (§8.1–8.4, §8.6; skip §8.5). Gantt-chart + average-waiting-time numericals → [Gate Smashers OS playlist](https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p).
- [ ] **Memory** — Ch 13 Address Spaces (§13.1–13.5) · Ch 16 Segmentation (§16.1–16.3, 16.6–16.7) · Ch 18 Paging (§18.1–18.4, 18.6) · Ch 19 TLBs (§19.1–19.5, 19.8) · Ch 21 Swapping (§21.1–21.5, 21.7) · Ch 22 Page-replacement **FIFO/LRU/Optimal** (§22.1–22.3, 22.5–22.6, 22.8, 22.11–22.12).
- [ ] **I/O & Disk** — Ch 36 I/O Devices (§36.1–36.4, 36.10) · Ch 37 HDDs (§37.1–37.6, **disk scheduling: FCFS, SSTF, SCAN, C-SCAN**).

**Consolidation + OYR self-test (Phase-1 gate):**
- [ ] On paper, from memory: ACID · TCP handshake · mutex vs semaphore · 5 SOLID principles · B-tree indexing · goroutine worker pool. Any blank → reread that source same day.
- [ ] Have someone (or me) fire **3 follow-ups per résumé bullet.** Anything you still can't defend → soften/cut now.
- [ ] **AI theory — evenings 2 & 3** (Appendix B, items 2–4). Theory now complete.

✅ **Phase-1 exit:** fresh DP/graph medium ≤30 min + explained aloud · all listed fundamentals re-derivable from memory · résumé fully defendable + reviewed · 15+ contacts / 10+ messages · AI theory done.

*(Optional, if you have spare energy: one LLD problem — Parking Lot or Rate Limiter — from [awesome-low-level-design](https://github.com/ashishps1/awesome-low-level-design).)*

---

# PHASE 2 — BACKEND DEPTH + PROJECT A1 + SOFT APPLICATIONS (Blocks 7–11)
**Phase exit:** narrate + defend your backend at a whiteboard · **Project A1 (RAG-RCA bot) deployed** · applications flowing to project-weighted roles.

**DSA now = maintenance:** 2–3/day, mixing review with these new patterns across the phase (don't let DP/graphs go cold):
- [ ] **Heap/PQ:** Kth Largest in a Stream · Last Stone Weight · K Closest Points to Origin · Task Scheduler · Find Median from Data Stream
- [ ] **Tries:** Implement Trie · Design Add and Search Words · Word Search II
- [ ] **Intervals:** Insert Interval · Merge Intervals · Non-overlapping Intervals · Meeting Rooms I · Meeting Rooms II
- [ ] **Greedy:** Maximum Subarray · Jump Game · Jump Game II · Gas Station · Hand of Straights
- [ ] **Backtracking:** Subsets · Combination Sum · Permutations · Word Search · Palindrome Partitioning · N-Queens

## Block 7 — APIs, contracts, idempotency · start Project A1
**Backend study:**
- [ ] [The Twelve-Factor App](https://12factor.net/) — read all 12; write one sentence per factor in your own words.
- [ ] **REST vs gRPC vs GraphQL** — [Kong — REST vs gRPC vs GraphQL](https://konghq.com/blog/engineering/rest-vs-grpc-vs-graphql). Memorize the decision rules (REST = public/cacheable; gRPC = internal typed/binary; GraphQL = client picks the shape).
- [ ] **API design + versioning + pagination** — [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/) (Principles, Resources, Compatibility, Pagination) + [Speakeasy — API versioning](https://www.speakeasy.com/api-design/versioning). Know **cursor vs offset** pagination and why cursor wins at scale.
- [ ] **Idempotency** — [Brandur — Idempotency Keys](https://brandur.org/idempotency-keys) + [AWS Builders' Library — Idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/).

**Build (this becomes A1's backend):**
- [ ] [FastAPI tutorial](https://fastapi.tiangolo.com/tutorial/) "First Steps" → "Request Body". Build `POST /users`, `GET /users/{id}`; add an idempotency key on the POST.
- [ ] **Project A1 — Day 1** (Appendix A): ingest → chunk → embed → store in pgvector.

**System design:**
- [ ] Read the [System Design Primer](https://github.com/donnemartin/system-design-primer) intro; write the **7-step framework** on a card (requirements → estimation → API → data model → high-level design → deep-dive → bottlenecks).

## Block 8 — DB internals + caching · A1 retrieval · SysD mock #1
**Backend study:**
- [ ] **Transactions/locking/MVCC** — [Vlad Mihalcea — locking & the lost update](https://vladmihalcea.com/a-beginners-guide-to-database-locking-and-the-lost-update-phenomena/).
- [ ] **DB selection** — [Which database should you use?](https://www.integrate.io/blog/which-database/): Postgres vs Mongo/Dynamo vs Cassandra vs Redis (use-case matrix).
- [ ] **Caching** — [Redis intro](https://redis.io/docs/about/): cache-aside pattern, TTLs, why Redis isn't your primary DB.
- [ ] **N+1 query problem** — [AppSignal — N+1 explained](https://blog.appsignal.com/2020/06/09/n-plus-one-queries-explained.html); then trigger and fix one in your FastAPI app with SQL logging on.

**Build:**
- [ ] **Project A1 — Day 2** (Appendix A): retrieve (cosine top-k) → grounded generate → citations; wrap as `POST /ask` + thin UI.

**System design:**
- [ ] **Mock #1 (timed 45 min): Design a URL shortener** (base62, DB + cache, read/write path). Record yourself; score against the [System Design Primer URL-shortener exercise](https://github.com/donnemartin/system-design-primer#design-a-url-shortener); debrief.

## Block 9 — Messaging & event-driven (defend your Kafka) · A1 measure · SysD mock #2 · GO LIVE (soft)
**Backend study — Kafka for real (your résumé claim):**
- [ ] [Kafka Introduction (official)](https://kafka.apache.org/intro) + [Hussein Nasser — Kafka deep-dives](https://www.youtube.com/results?search_query=hussein+nasser+kafka). Learn: partitions, consumer groups, offsets, **delivery semantics (at-most-once / at-least-once / exactly-once)**, consumer-group **rebalancing**, log compaction. → Now upgrade your Ericsson OYR answers and re-strengthen the résumé Kafka bullet honestly.
- [ ] **Event-driven patterns** — [Azure — Choreography vs Orchestration](https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography).

**Build:**
- [ ] **Project A1 — Day 3 (measure)** (Appendix A): 10–15 Q/expected pairs; score retrieval + faithfulness with [RAGAS](https://docs.ragas.io/en/stable/); improve one thing; record before/after numbers.

**System design:**
- [ ] **Mock #2: Design a rate limiter** (token bucket + sliding window).

**Job — go live on project-weighted roles** (your DSA is maturing; lead with experience, not DP-hard rounds):
- [ ] 5 referral-backed applications to AI-first startups / remote-global startups / experience-probing backend roles. Log every response.

## Block 10 — Distributed systems fundamentals · SysD mock #3 · apply
**Backend study:**
- [ ] **CAP, consistency, partitioning/sharding, consistent hashing, replication** — [System Design Primer — the section on these](https://github.com/donnemartin/system-design-primer#index-of-system-design-topics) + [ByteByteGo YouTube](https://www.youtube.com/@ByteByteGo) (search "consistent hashing", "data replication").
- [ ] **Resilience patterns** — retries, timeouts, exponential backoff, circuit breaker, idempotent retries.

**System design:**
- [ ] **Mock #3: Design a news feed / Twitter timeline** (fan-out on write vs read).

**Job:**
- [ ] 5–8 referral-backed applications; keep the tracker current.

## Block 11 — Reliability/SRE · ship A1 · SysD mock #4
**Backend study:**
- [ ] **SLI/SLO/SLA, observability (metrics/logs/traces), graceful degradation** — [Google SRE Book — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) (skim) — ties to your Grafana/Prometheus résumé line.

**Build:**
- [ ] **Project A1 — Day 4 (ship)** (Appendix A): deploy (Render/Railway/Fly); 1-page README (problem, architecture, eval before/after, "what I'd do at scale"); push to GitHub; **add the link to your résumé** (this also backs your ML/NumPy skills line).

**System design:**
- [ ] **Mock #4: Design a chat system / WhatsApp** (WebSockets, presence, delivery).

✅ **Phase-2 exit:** defend your backend + RCA end-to-end · 4 SysD mocks done · A1 live and on résumé · 15+ applications out.

---

# PHASE 3 — SYSTEM DESIGN DEPTH + PROJECT A2 + FULL APPLICATIONS (Blocks 12–15)
**Phase exit:** clear a fundamentals-level SD round comfortably · **A2 shipped** · pipeline full including the DSA-gated tier.
**DSA:** interview-maintenance, 2/day, emphasis on *explaining aloud* + speed; rotate your DP/graph "revisit" list.

## Block 12 — SysD: caching/CDN/read-scaling · open DSA-gated applications
- [ ] Study: caching layers, CDN, read replicas, DB scaling ([System Design Primer](https://github.com/donnemartin/system-design-primer)).
- [ ] **Mock #5: Design a web crawler.**
- [ ] **Job — open the DSA-gated tier** (FAANG-India, big unicorns) now that DSA is ready. Move to **8–10 applications/week** ongoing.

## Block 13 — SysD: storage + an AI design · build Project A2 · AI interview prep
- [ ] **Mock #6: Design a typeahead/autocomplete** (Trie + ranking — ties to your Tries DSA).
- [ ] **Mock #7: Design a RAG assistant for a regulated enterprise** (grounding, vector store, eval, guardrails) — your differentiator round. Prep from Appendix B "AI-engineer interview essentials".
- [ ] **Project A2 — both build days** (Appendix A): function-calling agent; wire "search my A1 infra docs" as one of its tools so the two projects compose. Ship + README + résumé link.

## Block 14 — SysD: geo-distributed · behavioral kickoff
- [ ] **Mock #8: Design a ride-sharing / location system** (geo-hashing, WebSockets — ties to your DHT research project).
- [ ] Start writing/rehearsing STAR stories daily (see Phase 4).

## Block 15 — SysD consolidation + portfolio polish
- [ ] **Mocks #9 & #10:** redo your two worst-scored designs, cold.
- [ ] Polish both project READMEs + GitHub; confirm the portfolio link is on the résumé.

✅ **Phase-3 exit:** 10 SD mocks total · 5 STAR stories drafted · both AI projects on résumé.

---

# PHASE 4 — INTERVIEW LOOPS + BEHAVIORAL (Blocks 13–18, overlapping)
**Run many loops in parallel — offers cluster; you want competing offers for leverage.**
- [ ] **Behavioral (daily 20–30 min):** write + rehearse 5 STAR stories from real material — (1) an incident/bug you owned (Ericsson "resolved critical bugs"), (2) pushing back on a bad requirement, (3) a project that failed / a call you corrected, (4) explaining tech to non-technical people (DigiBunai designers), (5) working with incomplete info. Framework + bank: [Tech Interview Handbook — behavioral](https://www.techinterviewhandbook.org/behavioral-interview/).
- [ ] **Per-company 1-pager:** what they sell, to whom, why you, 3 reasons. Read their eng blog; pull interview reports from [Levels.fyi](https://www.levels.fyi/), Glassdoor, LeetCode Discuss.
- [ ] **Weekly full mock loop** (DSA + SD + behavioral) with a peer or [Pramp](https://www.pramp.com/). **Rehearse the résumé deep-dive hardest** — your highest-risk round. Lead AI answers with *what you shipped and measured*, not buzzwords.

# PHASE 5 — NEGOTIATE & CLOSE (Blocks 17–20+)
- [ ] Stagger applications so **offers overlap**; slow-walk early offers (politely ask for time) while faster pipelines catch up.
- [ ] **Never accept on the spot.** Anchor with competing offers + your EXL base.
- [ ] Evaluate TC honestly: base vs equity vs joining bonus. Startups: ask funding stage, runway, last valuation, ESOP strike + liquidity.
- [ ] **Resign EXL only after signing.** Serve notice cleanly — keep them as a reference.

---

# APPENDIX A — The Two AI Projects (full build specs)

## Project A1 — RAG-RCA Assistant (headline artifact; built across Blocks 7–11)
**Idea:** an "ask-your-infrastructure" bot that retrieves over runbooks / incident logs / metrics docs and returns **grounded, cited root-cause hypotheses.** Extends your real Ericsson RCA work → one coherent story across résumé, project, and interview.
**Stack:** Python · FastAPI (the Block-7 service) · **pgvector** (Postgres you already run — one fewer moving part; defensible "retrieval next to relational data" choice; know *when* you'd switch to Pinecone/Weaviate = the senior nuance) · an LLM API (Claude/OpenAI) · thin Streamlit/HTML UI.
- [ ] **Day 1 (Block 7):** corpus of 20–50 docs (runbooks, postmortems, K8s guides, your own RCA notes) → load → **chunk** (~500 tokens, 50 overlap) → embed → store vectors + metadata (source, section) in pgvector. Ref: [LangChain RAG tutorial](https://python.langchain.com/docs/tutorials/rag/).
- [ ] **Day 2 (Block 8):** query → embed → cosine top-k from pgvector → grounded prompt (*"answer only from context; if absent, say you don't know"*) → answer **with citations**. Wrap as `POST /ask`; thin UI.
- [ ] **Day 3 (Block 9):** eval — 10–15 question/expected pairs; score retrieval + faithfulness ([RAGAS](https://docs.ragas.io/en/stable/) or a hand-rolled LLM-as-judge). **Improve one thing** (better chunking / hybrid keyword+semantic search / a reranker) and record **before/after numbers.**
- [ ] **Day 4 (Block 11):** deploy; 1-page README (problem, architecture, eval before/after, scale notes); GitHub; résumé link.
- **Deep-dive bar (be able to say):** the pipeline in one breath (load→chunk→embed→store→retrieve→rerank→generate) · why RAG not fine-tuning here · your chunking choice + its failure mode · how you measured quality + what moved it · where it breaks at scale (top-k latency at 10M vectors → **HNSW/IVF** indexes; embedding cost; stale docs).

## Project A2 — Function-Calling Agent (Block 13)
**Idea:** an LLM that *acts* — calls 2–3 real tools in a loop. Covers the "agents" topic every AI interview probes.
**Concept first:** [Anthropic — Building Effective Agents](https://www.anthropic.com/research/building-effective-agents). Agent = LLM + tools + memory + action loop; **ReAct** (reason→act→observe→repeat); failure modes (infinite loops, wrong tool, hallucinated args) + how you bound them (max steps, arg validation, human-in-loop).
- [ ] **Day 1:** define 2–3 tools with JSON schemas (a public API + a calculator + "search my A1 RAG"); get single-step correct tool + valid args. Ref: [OpenAI function calling](https://platform.openai.com/docs/guides/function-calling).
- [ ] **Day 2:** ReAct loop (model calls tool → you execute → feed result back → repeat) + **max-step bound** + arg validation. Compose with A1. README + GitHub + résumé link.
- **Deep-dive bar:** the loop + where it runs away · why you capped steps / validated args · when an agent is overkill vs a simple RAG call (judgment, not hype).

---

# APPENDIX B — Just-Enough AI Theory (3 evenings, done in Phase 1) + Interview Essentials
> Read only these. Each has a "must be able to say" bar. ⚡ items fix June-quiz inversions.
- [ ] **1. LLMs (evening 1):** [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) + play with [Tiktokenizer](https://tiktokenizer.vercel.app/). *Say:* what a token is; token count drives cost/latency/context; attention = every token attends to every other.
- [ ] **2. LLM controls + ⚡ (evening 2):** [Anthropic — Intro to Claude](https://docs.anthropic.com/en/docs/intro-to-claude). *Say:* temperature/top-p; the long-context tradeoff; **hallucination = confidently stated factually-wrong claims** (not "confusion"); **RLHF** is what makes a base model follow instructions.
- [ ] **3. Embeddings + ⚡ (evening 3a):** [Cohere — Text Embeddings Visually Explained](https://cohere.com/llmu/text-embeddings). *Say:* an embedding maps meaning → a vector in semantic space; **cosine similarity** = angle between vectors; why semantic search beats keyword.
- [ ] **4. RAG vs fine-tuning + ⚡ (evening 3b):** [Pinecone — RAG](https://www.pinecone.io/learn/retrieval-augmented-generation/). *Say verbatim:* **"Prompt first → RAG when the model needs to *know* things (dynamic/private/current data) → fine-tune only to change *behavior/format/style*, never to inject facts."**

**AI-engineer interview essentials (skim in Phase 3):**
- [ ] **RAG vs fine-tune vs prompt** ladder (most-asked). **Evals** — "how do you know it works?" → your A1 before/after numbers; [Hamel Husain — Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/). **Hallucination mitigation** — grounding/RAG, "say I don't know", structured output, citations. **Prompt injection** — [OWASP Top 10 for LLM Apps](https://genai.owasp.org/llm-top-10/) (name injection + 1 mitigation). **Cost/latency/quality triangle** — model choice, caching, streaming.
- **Deliberately SKIPPED — say this if asked:** Fine-tuning/LoRA → *"my problems were knowledge problems, so RAG was correct; LoRA is for behavior/format when prompting+RAG fail."* Training from scratch → *"not my layer; I build on foundation models, understand transformers conceptually."* Heavy MLOps/LangGraph → *"I keep agents simple and bounded; orchestration only when one loop isn't enough."*

---

# APPENDIX C — Consolidated Resource Index
| Area | Resource |
|---|---|
| DSA practice + videos | [NeetCode 150](https://neetcode.io/practice) · [NeetCode YouTube](https://www.youtube.com/@NeetCode) · [Graphs playlist](https://www.youtube.com/playlist?list=PLot-Xpze53leOBgcVsJBEGrHPd_7x_koV) · [DP playlist](https://www.youtube.com/playlist?list=PLot-Xpze53lcvx_tjrr_m2lgD2NsRHlNO) |
| OS | [OSTEP (book)](https://pages.cs.wisc.edu/~remzi/OSTEP/) · [Gate Smashers OS](https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p) · [Banker's Algorithm](https://www.geeksforgeeks.org/bankers-algorithm-in-operating-system/) |
| Go concurrency | [Go by Example — goroutines](https://gobyexample.com/goroutines) · [worker pools](https://gobyexample.com/worker-pools) · [mutexes](https://gobyexample.com/mutexes) |
| SQL | [LeetCode SQL 50](https://leetcode.com/studyplan/top-sql-50/) · [SQLBolt](https://sqlbolt.com/) · [Mode window functions](https://mode.com/sql-tutorial/sql-window-functions/) |
| DB theory/internals | [Isolation levels](https://backendbeyond.com/database-transaction-isolation-levels/) · [Normalization](https://www.geeksforgeeks.org/normal-forms-in-dbms/) · [Indexes](https://www.freecodecamp.org/news/how-database-indexes-work-a-practical-guide-with-postgresql-examples) · [Locking/MVCC](https://vladmihalcea.com/a-beginners-guide-to-database-locking-and-the-lost-update-phenomena/) · [N+1](https://blog.appsignal.com/2020/06/09/n-plus-one-queries-explained.html) |
| Networking | [TCP handshake](https://www.cloudflare.com/learning/ddos/glossary/three-way-handshake/) · [TCP/IP](https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/) · [HTTP/2 Explained](https://http2-explained.haxx.se/content/en/part1.html) · [WebSockets vs HTTP](https://ably.com/topic/websockets-vs-http-streaming) |
| OOP/SOLID/patterns | [Refactoring Guru — SOLID](https://refactoring.guru/design-patterns/solid-principles) · [Patterns](https://refactoring.guru/design-patterns) |
| LLD | [awesome-low-level-design](https://github.com/ashishps1/awesome-low-level-design) |
| Backend/APIs | [12-Factor](https://12factor.net/) · [REST/gRPC/GraphQL](https://konghq.com/blog/engineering/rest-vs-grpc-vs-graphql) · [Zalando API guidelines](https://opensource.zalando.com/restful-api-guidelines/) · [API versioning](https://www.speakeasy.com/api-design/versioning) · [Idempotency keys](https://brandur.org/idempotency-keys) · [AWS idempotency](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/) · [FastAPI tutorial](https://fastapi.tiangolo.com/tutorial/) |
| Databases (choice) + caching | [Which DB?](https://www.integrate.io/blog/which-database/) · [Redis intro](https://redis.io/docs/about/) |
| Messaging | [Kafka intro](https://kafka.apache.org/intro) · [Hussein Nasser](https://www.youtube.com/@hnasser) · [Choreography vs orchestration](https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography) |
| Distributed / System design | [System Design Primer](https://github.com/donnemartin/system-design-primer) · [ByteByteGo](https://www.youtube.com/@ByteByteGo) · [Gaurav Sen](https://www.youtube.com/@gkcs) |
| SRE/reliability | [Google SRE Book — SLOs](https://sre.google/sre-book/service-level-objectives/) |
| AI — LLMs/transformers | [Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) · [Tiktokenizer](https://tiktokenizer.vercel.app/) · [Anthropic Intro to Claude](https://docs.anthropic.com/en/docs/intro-to-claude) |
| AI — RAG/embeddings/eval | [Pinecone RAG](https://www.pinecone.io/learn/retrieval-augmented-generation/) · [Cohere embeddings](https://cohere.com/llmu/text-embeddings) · [LangChain RAG](https://python.langchain.com/docs/tutorials/rag/) · [RAGAS](https://docs.ragas.io/en/stable/) · [Hamel — evals](https://hamel.dev/blog/posts/evals/) |
| AI — agents/security | [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) · [OpenAI function calling](https://platform.openai.com/docs/guides/function-calling) · [OWASP LLM Top 10](https://genai.owasp.org/llm-top-10/) |
| Behavioral / interviews | [Tech Interview Handbook](https://www.techinterviewhandbook.org/behavioral-interview/) · [Levels.fyi](https://www.levels.fyi/) · [Pramp](https://www.pramp.com/) |

# APPENDIX D — Recurring Weekly Review (20 min)
- [ ] DSA: solved every study session? any pattern still cold? update the revisit list.
- [ ] OYR/SD: can I defend one more thing than last week?
- [ ] Applications: how many out, how many responses, how many referrals worked?
- [ ] One weak spot named + scheduled.
- [ ] Still employed and patient? (Yes = good. Don't panic-quit.)

*One engine (SDE), one anchor (DSA), AI as a measured-and-defendable portfolio, referrals as the CGPA workaround, and a job already in hand as your leverage. ₹40L+ is a realistic, repeatable outcome from where you stand.*

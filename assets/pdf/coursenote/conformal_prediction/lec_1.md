# Class Notes — Uncertainty Quantification, Conformal Prediction, Exchangeability & Permutation Tests

*Reference notes for Lectures 1 & 2. Every formula is stated, decoded symbol-by-symbol, and then run through a worked example.*

---

## 0. The big picture (read this first)

The whole story of these two lectures is one chain of logic:

1. **We can't trust a point prediction alone.** A model that says "the tumor is 3.1 cm" is useless in medicine/law/finance unless we know how wrong it might be. → **Uncertainty Quantification (UQ)**.
2. **Conformal Prediction** builds an honest error bar around *any* model, using held-out data. It comes with a mathematical coverage guarantee.
3. That guarantee only holds if the data satisfies one assumption: **exchangeability**.
4. Reality breaks exchangeability via **distribution shift / covariate shift**.
5. So we need a way to *test* exchangeability (or, more generally, whether a relationship is real) → **permutation tests**, which produce a **p-value**.
6. Both conformal prediction and permutation tests are secretly the same idea: **rank your real observation against a bag of equally-likely alternatives**. That bag is the **empirical distribution** $\hat{P}_n$.

```
UQ needed
   │
   ├─► Conformal Prediction ──requires──► Exchangeability ──broken by──► Distribution shift
   │        (error bars)                       │                              │
   │                                           ▼                              ▼
   └────────────── both rely on ──────► Empirical distribution ◄──── Permutation test
                                        (rank among shuffles)         (p-value)
```

---

## 1. Uncertainty Quantification (UQ)

**Why it exists:** errors are unavoidable. Two sources:
- **Finite data** — we only ever have $n$ samples, never the whole population.
- **Distribution shift** — the world at deployment ≠ the world at training.

We can't eliminate these, so instead of pretending the prediction is exact, we output a **set/interval** that is guaranteed to contain the truth with probability $1-\alpha$.

Notation: $\alpha$ is the **miscoverage rate**.
- $\alpha = 0.10 \Rightarrow 1-\alpha = 90\%$ coverage
- $\alpha = 0.05 \Rightarrow 1-\alpha = 95\%$ coverage
- $\alpha = 0.20 \Rightarrow 1-\alpha = 80\%$ coverage

---

## 2. Split (Inductive) Conformal Prediction

### 2.1 The goal

Given a new input $X_{n+1}$, build a set $\hat{C}_n(X_{n+1})$ such that

$$\mathbb{P}\big(Y_{n+1} \in \hat{C}_n(X_{n+1})\big) \ \ge\ 1-\alpha$$

**The killer feature:** this holds for *any* model — linear regression, random forest, a 70-billion-parameter neural net. The method is **model-free** (also called *distribution-free*). It doesn't care how the predictions were made; it only looks at how wrong they were.

### 2.2 The recipe (4 steps)

**Step 1 — Split the data ✂️**

Split your $n$ points into two **disjoint** (non-overlapping) sets:
- $\mathcal{D}_1$ = training set, size $n_1$
- $\mathcal{D}_2$ = calibration set, size $n_2$

**Step 2 — Train 🧠**

Fit the model on $\mathcal{D}_1$ only. Call the fitted function $\hat{f}_{n_1}$.

**Step 3 — Compute residuals on the calibration set 📏**

For each $i \in \mathcal{D}_2$:

$$R_i = \big|\,Y_i - \hat{f}_{n_1}(X_i)\,\big|$$

These are called **nonconformity scores** — "how badly does this point conform to my model?"

> ### ⚠️ Why a *separate* calibration set?
> If you measured residuals on $\mathcal{D}_1$, the model has effectively memorized those points. The residuals would be **artificially small**, your interval would be **too narrow**, and your 90% guarantee would actually deliver maybe 60% coverage. $\mathcal{D}_2$ is data the model has never seen, so $R_i$ is an *honest* sample of the error the model makes on fresh data.

**Step 4 — Take the quantile and build the interval 🎯**

Sort the residuals $R_{(1)} \le R_{(2)} \le \dots \le R_{(n_2)}$. Then

$$\boxed{\ \hat{q}_{n_2} = \Big\lceil (1-\alpha)(n_2+1) \Big\rceil\text{-th smallest residual}\ }$$

$$\boxed{\ \hat{C}_n(X_{n+1}) = \Big[\ \hat{f}_{n_1}(X_{n+1}) - \hat{q}_{n_2}\ ,\ \ \hat{f}_{n_1}(X_{n+1}) + \hat{q}_{n_2}\ \Big]\ }$$

Symbol decoder:
| Symbol | Meaning |
|---|---|
| $\lceil \cdot \rceil$ | ceiling — **round up** to the next whole number |
| $n_2$ | number of calibration points |
| $\hat{q}_{n_2}$ | the residual threshold (half-width of the interval) |
| $\hat{f}_{n_1}$ | model trained on $\mathcal{D}_1$ |

**Why $n_2+1$ and not $n_2$?** Because the new point $(X_{n+1}, Y_{n+1})$ is being treated as *one more member* of the calibration set. There are $n_2+1$ residuals in play conceptually, and we ask: "where does the new one rank among them?" Under exchangeability, it is equally likely to land in any of the $n_2+1$ slots.

### 2.3 Worked example (from lecture)

Calibration set $n_2 = 9$, want $80\%$ coverage so $1-\alpha = 0.8$.

$$\lceil 0.8 \times (9+1) \rceil = \lceil 8.0 \rceil = 8$$

→ Use the **8th smallest** residual.

Say the sorted residuals are:

$$0.3,\ 0.5,\ 0.9,\ 1.1,\ 1.4,\ 1.8,\ 2.0,\ \mathbf{2.5},\ 4.1$$

The 8th smallest is $\hat{q}_{n_2} = 2.5$.

If the model predicts $\hat{f}_{n_1}(X_{10}) = 12.0$ for a new patient, the prediction interval is

$$[12.0 - 2.5,\ 12.0 + 2.5] = [9.5,\ 14.5]$$

Interpretation: *"Based on how my model performed on unseen calibration data, the true value lies in $[9.5, 14.5]$ with at least 80% probability."*

**Second example (to check you've got it):** $n_2 = 99$, $\alpha = 0.05$.
$\lceil 0.95 \times 100 \rceil = \lceil 95 \rceil = 95$ → the 95th smallest of 99 residuals.

**Edge case:** if $\lceil(1-\alpha)(n_2+1)\rceil > n_2$ (too little calibration data for the coverage you asked for), set $\hat{q}_{n_2} = +\infty$ — the interval is the whole real line. Useless, but still *honest*. E.g. $n_2 = 9$, $\alpha = 0.05$: $\lceil 0.95 \times 10\rceil = 10 > 9$. You simply cannot promise 95% with only 9 calibration points.

### 2.4 The guarantee, precisely

$$1-\alpha \ \le\ \mathbb{P}\big(Y_{n+1} \in \hat{C}_n(X_{n+1})\big)\ \le\ 1-\alpha+\frac{1}{n_2+1}$$

So coverage is not just *at least* $1-\alpha$; it's also not wildly conservative. **This holds only under exchangeability of $\mathcal{D}_2 \cup \{(X_{n+1},Y_{n+1})\}$.**

---

## 3. Exchangeability

### 3.1 Intuition

**Exchangeable = the order of the data points doesn't matter.** Shuffle your dataset like a deck of cards, and the joint distribution is unchanged.

### 3.2 Formal definition (Definition 2.1)

$Z_1,\dots,Z_n$ are **exchangeable** if for every permutation $\sigma \in S_n$:

$$\boxed{\ (Z_1,\dots,Z_n) \overset{d}{=} (Z_{\sigma(1)},\dots,Z_{\sigma(n)})\ }$$

| Symbol | Meaning |
|---|---|
| $\sigma$ (sigma) | one specific shuffle / permutation |
| $S_n$ | the set of **all** $n!$ possible shuffles of $n$ items |
| $\sigma(1)$ | "which original item ends up in position 1" |
| $\overset{d}{=}$ | **equality in distribution** |

**Notation gotcha (this tripped me up):** if $\sigma$ swaps the 1st and 3rd of three items, then $\sigma(1)=3,\ \sigma(2)=2,\ \sigma(3)=1$, so

$$(Z_{\sigma(1)}, Z_{\sigma(2)}, Z_{\sigma(3)}) = (Z_3, Z_2, Z_1)$$

You substitute the *number* in — you don't leave the $\sigma$ sitting there.

### 3.3 What "$\overset{d}{=}$" (equal in distribution) actually means

A **distribution** is the complete *rulebook* for how a random thing behaves — the full list of "outcome → probability".

Two random objects are **equal in distribution** if they follow the *identical rulebook*, even if they are physically different things.

- 🎲 **Yes:** a red die and a blue die. $\mathbb{P}(\text{red}=3) = \mathbb{P}(\text{blue}=3) = 1/6$ for every face. Different objects, same rulebook → $\overset{d}{=}$.
- 🪙 **No:** a fair coin (50/50) and a weighted coin (75/25). Different probabilities → **not** equal in distribution.

Note: equal in distribution does **not** mean equal. The red die and blue die can roll different numbers on any given throw. It's the *rulebook* that matches, not the outcome.

For sequences, the rulebook is over *whole tuples*: $\mathbb{P}(Z_1=a, Z_2=b)$ for every pair $(a,b)$. Exchangeability says this table is unchanged when you permute the positions.

### 3.4 Concrete binary example (from lecture)

$(Z_1, Z_2)$ each taking values in $\{0,1\}$:

| Outcome | Probability |
|---|---|
| $(0,0)$ | $1/8$ |
| $(0,1)$ | $3/8$ |
| $(1,0)$ | $3/8$ |
| $(1,1)$ | $1/8$ |

**Exchangeable?** Check $(Z_1,Z_2) \overset{d}{=} (Z_2,Z_1)$. Swapping means $\mathbb{P}(0,1)$ must equal $\mathbb{P}(1,0)$: $3/8 = 3/8$ ✓. And $(0,0)$, $(1,1)$ map to themselves ✓. **Yes, exchangeable.**

**Independent?** Marginals: $\mathbb{P}(Z_1=1) = 3/8+1/8 = 1/2$, same for $Z_2$. If independent we'd need $\mathbb{P}(1,1) = \tfrac12 \cdot \tfrac12 = 1/4$. But it's $1/8 \ne 1/4$. **Not independent.**

→ **This single table is the whole punchline: exchangeable but not i.i.d.**

### 3.5 i.i.d. vs exchangeable

$$\text{i.i.d.} \subsetneq \text{exchangeable}$$

- **i.i.d.** = independent **and** identically distributed.
- **Exchangeable** = identically distributed, but dependence is allowed — as long as the dependence is *symmetric* (doesn't care about position).

Every i.i.d. sequence is exchangeable. The converse is false.

| Scenario | Independent? | Exchangeable? |
|---|---|---|
| Flip a known fair coin twice | ✅ Yes | ✅ Yes |
| Draw 2 cards **without** replacement | ❌ No (drawing an Ace lowers the odds of a 2nd Ace) | ✅ Yes ($\mathbb{P}(\text{Ace, King}) = \mathbb{P}(\text{King, Ace})$) |
| Pull names from a hat to form a team | ❌ No | ✅ Yes |
| Time series: today's stock price, tomorrow's | ❌ No | ❌ No (order is the whole point) |

**Sampling without replacement is the canonical example** of exchangeable-but-not-independent.

### 3.6 The mystery coin (Bayesian example, with the integral)

Setup from the notes:

$$\theta \sim \text{Uniform}(0,1), \qquad X_i \mid \theta \overset{iid}{\sim} \text{Bernoulli}(\theta)$$

Story: a factory makes coins with every possible bias. You blindly grab **one** coin (its bias $\theta$ is unknown, uniform on $[0,1]$), then flip *that same coin* $n$ times.

**Why not independent?** Because you're *learning about $\theta$ as you flip.* Ten heads in a row is strong evidence the coin is head-biased, so it changes your belief about flip 11. Formally:

$$\mathbb{P}(X_2 = 1 \mid X_1 = 1) = \frac{\mathbb{P}(X_1=1, X_2=1)}{\mathbb{P}(X_1=1)} = \frac{\int_0^1 \theta^2 d\theta}{\int_0^1 \theta\, d\theta} = \frac{1/3}{1/2} = \frac{2}{3} \ne \frac{1}{2} = \mathbb{P}(X_2=1)$$

The flips are **dependent**. (Contrast: with a *known* fair quarter, 10 heads teaches you nothing — flip 11 is still 50%.)

**Why exchangeable?** Marginalize (integrate) over the unknown bias:

$$\mathbb{P}(X_1=x_1,\dots,X_n=x_n) = \int_0^1 \theta^{\sum_i x_i}\,(1-\theta)^{\,n - \sum_i x_i}\, d\theta$$

$$= B\Big(\textstyle\sum x_i + 1,\ n-\sum x_i + 1\Big) = \frac{\big(\sum x_i\big)!\,\big(n-\sum x_i\big)!}{(n+1)!}$$

**The key observation:** the answer depends *only* on $\sum_{i=1}^n x_i$ — the total number of heads — and **not on the order**. Any permutation of the same $x_i$'s has the same sum, hence the same probability. → **Exchangeable.** ∎

**Sanity check with $n=3$:** $\mathbb{P}(H,H,T) = \frac{2!\,1!}{4!} = \frac{2}{24} = \frac{1}{12}$, and $\mathbb{P}(H,T,H) = \frac{2!\,1!}{4!} = \frac{1}{12}$. Same ✓.

### 3.7 Why conformal prediction needs it

We need $(X_{n+1},Y_{n+1})$ to be exchangeable with the calibration points $\mathcal{D}_2$. If so, the new residual $R_{n+1}$ is **equally likely to occupy any of the $n_2+1$ rank positions** among the sorted residuals. That's exactly why counting ranks gives a valid probability — no distributional assumptions needed anywhere else.

---

## 4. Empirical Distribution $\hat{P}_n$

### 4.1 The formula

$$\boxed{\ \hat{P}_n = \frac{1}{n}\sum_{i=1}^{n} \delta_{Z_i}\ }$$

**The delta measure $\delta_{Z_i}$** (a *point mass*): a function that puts weight $1$ exactly at the location $Z_i$ and $0$ everywhere else.

$$\delta_z(A) = \begin{cases} 1 & \text{if } z \in A \\ 0 & \text{otherwise}\end{cases}$$

Mental image: drop a heavy block on the number line exactly where each data point landed. Sum the blocks, divide by $n$ so they total probability 1.

**In plain English:** $\hat{P}_n$ is a custom, homemade rulebook in which *every observed data point gets equal weight $1/n$, and nothing else can happen.* It's not a smooth bell curve — it's a set of spikes sitting exactly on your data.

### 4.2 Worked example

Dataset $n = 4$: $\ Z_1 = 3,\ Z_2 = 7,\ Z_3 = 7,\ Z_4 = 9$.

$$\hat{P}_4 = \tfrac14\delta_3 + \tfrac14\delta_7 + \tfrac14\delta_7 + \tfrac14\delta_9$$

| Value | Empirical probability |
|---|---|
| 3 | $1/4$ |
| 7 | $1/4 + 1/4 = \mathbf{2/4} = 0.5$ ← **duplicates stack!** |
| 9 | $1/4$ |

⚠️ **Trap:** each *observation* gets $1/n$, but a repeated *value* collects the weight of every slot it occupies.

### 4.3 Proposition 2.2 — exchangeability and the empirical distribution

$$\boxed{\ Z_i \mid \hat{P}_n \ \sim\ \hat{P}_n\ }$$

**Reading "$\mid \hat{P}_n$" (conditioning on the empirical distribution):** *you know exactly which multiset of values you collected, but you've completely lost track of which one came first.*

**What the proposition says:** for exchangeable data, once you've thrown away the order, guessing the value of any particular $Z_i$ is exactly the same as **blindly drawing one slip of paper out of a hat containing your data.**

Example with $\{3,7,7,9\}$ scrambled in a hat:
- $\mathbb{P}(Z_1 = 9 \mid \hat{P}_4) = 1/4$ (one 9 out of four slips)
- $\mathbb{P}(Z_1 = 7 \mid \hat{P}_4) = 2/4$
- Same answer for $Z_2$, $Z_3$, $Z_4$ — **that's what exchangeability buys you.**

**Why this proposition is the engine of both methods:**
- *Conformal:* the new residual is like a blind draw from the hat of calibration residuals → its rank is uniform → coverage guarantee.
- *Permutation test:* under $H_0$, your real dataset is just one blind draw from the hat of all shuffles → its test statistic's rank is uniform → valid p-value.

---

## 5. Distribution Shift / Covariate Shift

Write the joint distribution as

$$P(X,Y) = P(Y \mid X)\,P(X)$$

- $P(X)$ = the distribution of **inputs / covariates** (who walks in the door)
- $P(Y\mid X)$ = the **conditional rule** linking inputs to outcomes (the underlying science)

**Covariate shift** = $P(X)$ changes, $P(Y\mid X)$ stays the same.

**Running example:** train + calibrate a medical model in a **New York** hospital, deploy it in **Tokyo**.
- The biology ($P(Y\mid X)$ — how symptoms map to disease) is plausibly unchanged.
- The patient population ($P(X)$ — ages, diets, comorbidities, referral patterns) is different.

**Consequence:** the Tokyo point is **not exchangeable** with the New York calibration set. The residual ranking argument collapses, and $\hat{C}_n$ no longer covers at $1-\alpha$. Your safety net has a hole in it and you won't notice unless you test.

→ *So how do we test it?* Permutation tests.

---

## 6. Permutation Tests 🧪

### 6.1 Hypotheses

$$H_0: \text{the data distribution is exchangeable} \qquad \text{vs} \qquad H_1: \text{it is not}$$

(In the regression application below, this becomes $H_0: \beta = 0$, i.e. $X$ and $Y$ are unrelated.)

### 6.2 The test statistic $T$

A **test statistic** is just *one number computed from the data that measures the pattern you care about.*

- **Large $T$** → a strong, distinctive pattern tied to the specific ordering/pairing → evidence **against** $H_0$.
- **Small $T$** → no real pattern → consistent with $H_0$.

### 6.3 The procedure

1. Compute $T_1$ = statistic on the **real, unshuffled** data.
2. For $j = 2,\dots,M+1$: apply a random permutation $\sigma$, recompute the statistic → $T_j$.
3. Build the empirical distribution of the shuffled statistics:
   $$\hat{P}_m = \frac{1}{m}\sum_{i=1}^{m}\delta_{T_i}$$
   This is the **null distribution** — a picture of "what does pure noise look like?"
4. Compute the p-value by seeing how extreme $T_1$ is inside that picture.

**The logic:** shuffling deliberately *destroys* any real structure, manufacturing a world where $H_0$ is true. If $H_0$ was true all along, your real data is nothing special — just one arrangement among many — so $T_1$ should **blend in**. If $T_1$ **sticks out** at the far right tail, $H_0$ must be wrong.

### 6.4 The p-value formula

$$\boxed{\ p = \frac{1 + \#\{\,j : T_j \ge T_1\,\}}{1 + M}\ }$$

where $M$ = number of shuffles.

**Why the $+1$ on top and bottom?** Your original, unshuffled dataset is itself one of the valid arrangements under $H_0$, so it must be counted. This also guarantees $p > 0$ always — you can never claim infinite evidence from finitely many shuffles.

### 6.5 Worked example

$M = 99$ shuffles. Exactly $1$ shuffled statistic came out $\ge T_1$.

$$p = \frac{1+1}{1+99} = \frac{2}{100} = 0.02$$

$0.02 < 0.05$ → **reject $H_0$.**

Conclusion in the hospital story: the NY and Tokyo data are **not exchangeable**. The distribution shift is real, and the conformal interval calibrated on NY data cannot be trusted for Tokyo patients.

**Counter-example for contrast:** if 45 out of 99 shuffles beat $T_1$, then $p = 46/100 = 0.46$ → **fail to reject.** Your data looks exactly like noise; no evidence against exchangeability. (Note: "fail to reject" ≠ "proved exchangeable" — absence of evidence isn't evidence of absence.)

**Smallest possible p-value:** with $M=99$, the best you can ever get is $1/100 = 0.01$. Want to be able to report $p < 0.001$? You need $M \ge 999$.

---

## 7. Linear Regression + Permutation Test 📈

### 7.1 The model

$$Y_i = \alpha + \beta X_i + \varepsilon_i$$

- $\alpha$ = intercept, $\beta$ = **slope** (the thing we care about), $\varepsilon_i$ = noise.
- "Line of best fit" — yes, exactly that.

### 7.2 The slope estimate

$$\boxed{\ \hat\beta = \frac{\sum_{i=1}^n (y_i - \bar y)(x_i - \bar x)}{\sum_{i=1}^n (x_i - \bar x)^2}\ }$$

| Piece | Meaning |
|---|---|
| $\bar x,\ \bar y$ | the **averages** (means) of the $x$'s and $y$'s |
| $(x_i - \bar x)$ | how far this point's $x$ is from average $x$ |
| $(y_i - \bar y)$ | how far this point's $y$ is from average $y$ |
| numerator | **covariance-like**: do $x$ and $y$ deviate in the *same direction* together? |
| denominator | **variance-like**: how spread out are the $x$'s? (a normalizer) |

**Reading the numerator:** if a point is above-average in both $x$ and $y$, the product $(+)(+)$ is positive. Below-average in both, $(-)(-)$ is also positive. So if $x$ and $y$ move together, positives pile up and the sum is large. If the relationship is random, positives and negatives cancel → sum near 0.

**What $\hat\beta = 0$ means:** the fit is a **flat horizontal line** at height $\bar y$. No matter what $X$ is, your prediction for $Y$ is the same. → **$X$ carries zero information about $Y$.**

### 7.3 Standard error and the test statistic

$$se(\hat\beta) = \frac{\hat\sigma}{\sqrt{\sum_i (x_i-\bar x)^2}}, \qquad \hat\sigma^2 = \frac{1}{n-2}\sum_i \big(y_i - \hat\alpha - \hat\beta x_i\big)^2$$

$$\boxed{\ T = \frac{\hat\beta}{se(\hat\beta)}\ }$$

**Why divide by the standard error?** A raw slope of $5$ means nothing on its own — it could be 5 units of signal in an ocean of noise, or a rock-solid effect. $se(\hat\beta)$ measures the noise. So $T$ asks:

> *"Is this slope big **relative to how uncertain I am about it**? Real pattern, or random wiggle?"*

$T$ is unitless — it's "number of standard errors away from zero."

### 7.4 The permutation test on regression

$$H_0: \beta = 0 \quad (X \text{ and } Y \text{ are unrelated})$$

1. Compute $T_1$ from the real $(x_i, y_i)$ pairs.
2. **Keep the $x_i$ fixed; shuffle the $y_i$:** form pairs $(x_i, y_{\sigma(i)})$ for a random $\sigma \in S_n$. Refit, recompute $T$. Repeat → $T_2,\dots,T_m$.
3. Build $\hat P_m = \frac{1}{m}\sum_{i=1}^m \delta_{T_i}$ — centered at $0$, since shuffled data has no relationship.
4. $\displaystyle p = \frac{1+\#\{T_j \ge T_1\}}{1+M}$. (The notes' compact line $\int \mathbb{1}(T \ge t)\,d\hat P_m = p\text{-value}$ is literally "the fraction of the shuffled distribution sitting at or above $t$".)

> ### ❓ Why shuffle $Y$ while keeping $X$ in place?
> Under $H_0$, the *pairing* of a specific $x$ with a specific $y$ is pure coincidence — like using shoe size to predict a math score. If there's genuinely no link, handing someone else's math score to the size-9 person changes nothing about the overall distribution.
>
> Shuffling $Y$ deliberately **severs any real bond** between $X$ and $Y$ while keeping both sets of values intact. You've manufactured a dataset drawn from a world where $H_0$ is exactly true — a free sample from the null distribution.
>
> You could shuffle $X$ instead and get the identical test; shuffling $Y$ is just convention.

**What to expect:** shuffled $\hat\beta \approx 0$ ⟹ shuffled $T \approx 0$ ⟹ they cluster tightly around zero. If your real $T_1$ is way out in the right tail, almost no shuffle beats it, the count is tiny, $p$ is tiny → **reject $H_0$** → **$X$ is a statistically significant predictor of $Y$.**

### 7.5 Mini numeric walkthrough

Data: $x = (1,2,3,4,5)$, $y = (2,4,5,4,9)$.

$\bar x = 3$, $\bar y = 4.8$.

| $i$ | $x_i-\bar x$ | $y_i-\bar y$ | product | $(x_i-\bar x)^2$ |
|---|---|---|---|---|
| 1 | $-2$ | $-2.8$ | $5.6$ | 4 |
| 2 | $-1$ | $-0.8$ | $0.8$ | 1 |
| 3 | $0$ | $0.2$ | $0$ | 0 |
| 4 | $1$ | $-0.8$ | $-0.8$ | 1 |
| 5 | $2$ | $4.2$ | $8.4$ | 4 |
| **Σ** | | | $\mathbf{14.0}$ | $\mathbf{10}$ |

$$\hat\beta = \frac{14.0}{10} = 1.4$$

Now shuffle: suppose $y$ becomes $(4,9,2,5,4)$ against the same $x$. Recompute — the products no longer line up by sign, the sum collapses toward zero, and you get some $\hat\beta$ near 0. Do that 999 times, collect the $T$'s, and check where the real $T_1$ falls.

---

## 8. Formula cheat sheet

| Concept | Formula |
|---|---|
| Conformal residual | $R_i = \lvert Y_i - \hat f_{n_1}(X_i)\rvert$ |
| Conformal quantile | $\hat q_{n_2} = \lceil (1-\alpha)(n_2+1)\rceil$-th smallest $R_i$ |
| Prediction interval | $[\hat f_{n_1}(X_{n+1}) - \hat q_{n_2},\ \hat f_{n_1}(X_{n+1}) + \hat q_{n_2}]$ |
| Coverage guarantee | $1-\alpha \le \mathbb{P}(Y_{n+1}\in\hat C_n) \le 1-\alpha + \frac{1}{n_2+1}$ |
| Exchangeability | $(Z_1,\dots,Z_n) \overset{d}{=} (Z_{\sigma(1)},\dots,Z_{\sigma(n)}),\ \forall\sigma\in S_n$ |
| Empirical distribution | $\hat P_n = \frac1n\sum_{i=1}^n \delta_{Z_i}$ |
| Prop 2.2 | $Z_i \mid \hat P_n \sim \hat P_n$ |
| Mystery coin | $\theta\sim U(0,1),\ X_i\mid\theta\sim \text{Bern}(\theta)$; $\ \mathbb{P}(x_{1:n}) = \frac{(\sum x_i)!\,(n-\sum x_i)!}{(n+1)!}$ |
| Covariate shift | $P(X)$ changes, $P(Y\mid X)$ fixed |
| Regression slope | $\hat\beta = \frac{\sum(y_i-\bar y)(x_i-\bar x)}{\sum (x_i-\bar x)^2}$ |
| Test statistic | $T = \hat\beta / se(\hat\beta)$ |
| Permutation p-value | $p = \frac{1+\#\{T_j \ge T_1\}}{1+M}$ |

---

## 9. Sticking points, answered

**Q: Why can't I just use training residuals?**
The model memorized the training data; residuals there are optimistically small and your interval will under-cover.

**Q: Does "equal in distribution" mean the values are equal?**
No. It means the *probability rulebooks* match. Red die vs blue die: equal in distribution, but they roll different numbers.

**Q: Is exchangeable the same as i.i.d.?**
No. i.i.d. ⟹ exchangeable, never the reverse. Exchangeable drops **independence** and keeps only "identically distributed + order-blind". Sampling without replacement is the standard witness.

**Q: If the flips depend on each other, how can order not matter?**
The dependence is *symmetric*. Every flip tells you about the same hidden $\theta$, and each flip is affected equally. Nothing about the dependence privileges position 1 over position 7.

**Q: What does the $\lceil \cdot \rceil$ do again?**
Rounds **up**. $\lceil 7.2 \rceil = 8$, $\lceil 8.0 \rceil = 8$.

**Q: Why is there a $+1$ everywhere?**
Because the new/real observation is being counted as one of the equally-likely arrangements. It appears as $n_2+1$ in conformal and as $1+M$ in the permutation p-value — same idea, two places.

**Q: Small p-value → do what?**
Reject $H_0$. In the exchangeability test: conclude the data is **not** exchangeable → your conformal guarantee is void. In the regression test: conclude $\beta \ne 0$ → $X$ genuinely predicts $Y$.

---

## 10. Self-check before class

1. $n_2 = 19$ calibration points, $\alpha = 0.10$. Which sorted residual is $\hat q$?
2. Give a dataset that is exchangeable but not independent, and say why.
3. In $\{2,2,5,8\}$, what is $\hat P_4(\{2\})$?
4. You run $M = 199$ shuffles; 3 have $T_j \ge T_1$. Compute $p$. Reject at 0.05?
5. Under covariate shift, which of $P(X)$ and $P(Y\mid X)$ changes?
6. Your fitted $\hat\beta$ is large but $se(\hat\beta)$ is also huge. Is $T$ large or small — and does that support rejecting $H_0$?

<details>
<summary><b>Answers</b></summary>

1. $\lceil 0.9 \times 20\rceil = \lceil 18 \rceil = 18$ → the 18th smallest.
2. Drawing cards without replacement (or the $(0,0)=1/8,(0,1)=(1,0)=3/8,(1,1)=1/8$ table, or the mystery coin). Dependent because earlier draws change the odds for later ones; exchangeable because swapping positions leaves every joint probability unchanged.
3. $2/4 = 0.5$ — the value 2 occupies two of the four slots.
4. $p = \frac{1+3}{1+199} = \frac{4}{200} = 0.02 < 0.05$ → reject $H_0$.
5. $P(X)$ changes; $P(Y\mid X)$ stays fixed.
6. $T = \hat\beta/se(\hat\beta)$ is **small** — the slope is drowning in noise. Weak evidence; do **not** reject $H_0$.
</details>
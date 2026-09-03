So, we are back to some very fundamental stuff.

Which is honestly kind of interesting — getting into the actual fundamentals of computer vision, from before the big LLM explosion.

Anyway, let's start.

# Image Filtering

## Motivations

Image filtering is a set of *local* operations performed on an image. Two tasks make it essential:

1. **Edge detection.** Edges are locations where image intensity changes sharply. Detecting them matters because they usually mark where something physical changes — a shadow boundary, a change of material, the outline of an object.
2. **Noise reduction.** Real-world images carry random, pixel-independent noise that spikes intensity at scattered pixels. Filtering smooths the image and suppresses those spikes.

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Edge</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">A position in an image where the intensity undergoes a large change in value.</p>
  <p style="margin: 0;">The computational problem of finding intensity edges in an image is called <i>edge detection</i>.</p>
</div>

## Scenario Setup

For the sake of learning, we make two large simplifications:

1. Instead of the usual RGB (3 channels), we work with a single channel, which we will call *intensity*.
2. Instead of a 2D image $I(x, y)$, we start with a 1D image $I(x)$.

For this blog we consider only one application: detecting image edges in the presence of image noise.

To detect an edge, we need to compare the intensities of pixels in a local neighborhood and look for a large change. There are two basic ways to do this: **local differences** and **local averages**.

## Local Difference

Consider a 1D image $I(x)$, where $x$ is a specific location in the image.

An approximation of its derivative is the **central difference**

$$I_{diff}(x) = \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1)$$

Wait — why does this approximate the derivative?

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Math Review</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">By definition, the derivative of a continuous function $f$ can be written in <i>symmetric</i> (or <i>central</i>) form:</p>

  $$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x-h)}{2h}$$

  <p style="margin: 10px 0;">An image is discrete, so the smallest step we can take is one pixel: $h = 1$. Dropping the limit and setting $h = 1$:</p>

  $$f'(x) \approx \frac{f(x+1) - f(x-1)}{2} = \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1) = I_{diff}(x)$$

  <p style="margin: 10px 0 0 0;">Why the symmetric form and not the one-sided $f(x+1) - f(x)$? A Taylor expansion shows the one-sided difference has error $O(h)$, while the symmetric difference cancels the first-order error term and is accurate to $O(h^2)$. It is also centered on the pixel $x$ itself, so it does not shift edges sideways.</p>
</div>

So, what does this tell us?

Think of $I_{diff}(x)$ as the first derivative of the image:

1. A large **positive** $I_{diff}(x)$ = an edge going from low to high intensity.
2. A large **negative** $I_{diff}(x)$ = an edge going from high to low intensity.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Local Difference</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Consider an image consisting of a single edge at position $x = x_0$. Precisely:</p>

  $$
    I(x) = \begin{cases}
    100, & x > x_0 \\
    70,  & x = x_0 \\
    40,  & x < x_0
    \end{cases}
  $$

  <p style="margin: 10px 0;">Applying the central difference $I_{diff}(x) = \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1)$ gives:</p>

  $$
    I_{diff}(x) = \begin{cases}
    0,  & x > x_0 + 1 \\
    15, & x = x_0 + 1 \\
    30, & x = x_0 \\
    15, & x = x_0 - 1 \\
    0,  & x < x_0 - 1
    \end{cases}
  $$

  <p style="margin: 10px 0 0 0;">As expected, $I_{diff}(x)$ attains its maximum absolute value exactly at the edge location.</p>
</div>

One caveat: $I_{diff}(x)$ is undefined at the first and last pixel of the image, because $I(x-1)$ or $I(x+1)$ falls off the edge. There are several standard fixes — zero-padding, replicating the border pixel, reflecting, wrapping — and we will come back to them.

## Local Average

Real-world images contain noise, spread randomly across pixels. How do we reduce it?

Here is one line of thought: image intensity tends to vary slowly from pixel to pixel (except at edges, of course). So we can suppress noise by **smoothing** the image — replacing each pixel with a weighted **local average** of its neighbors:

$$I_{smooth}(x) = \tfrac{1}{4}I(x-1) + \tfrac{1}{2}I(x) + \tfrac{1}{4}I(x+1)$$

The weights $\tfrac{1}{4}, \tfrac{1}{2}, \tfrac{1}{4}$ are a design choice, not a law. The one real constraint is that they must **sum to 1** — otherwise the operation would brighten or darken the image on top of smoothing it.

As with the local difference, the left and right boundaries are undefined for the local average.

---

Now look closely at the two operations we just built:

- **Local difference:** $I_{diff}(x) = \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1)$
- **Local average:** $I_{smooth}(x) = \tfrac{1}{4}I(x-1) + \tfrac{1}{2}I(x) + \tfrac{1}{4}I(x+1)$

What do they have in common? Both take an image, look at a **local neighborhood** around a pixel, and compute a linear combination of the nearby pixels using **fixed weights**.

This is exactly what discrete convolution formalizes.

---

## Discrete Convolution

Treat the image $I(x)$ as an $N$-dimensional vector. Then both $I_{diff}(x)$ and $I_{smooth}(x)$ are **linear transformations** of $I(x)$, and each can be represented by an $N \times N$ matrix.

But those matrices are almost entirely zero: each output pixel depends only on a handful of nearby input pixels. Instead of writing out a full $N \times N$ matrix every time, we use a lighter-weight tool — **convolution** (and its close cousin **cross-correlation**). We focus on convolution first and return to the difference between the two later.

### Discrete convolution in 1D

Consider an image $I(x)$ and a filter $f(x)$ (for example, local difference or local average).

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Filter</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0;">A function $f(x)$ that is convolved with an image is called a <b>filter</b>. We say we are <i>filtering</i> the image with $f(x)$.</p>
</div>

The convolution of $I(x)$ with $f(x)$ is defined as

$$I(x) * f(x) \;\equiv\; \sum_{a} I(a)\, f(x - a)$$

Sit with it for a moment. Three roles:

- $x$ is the **output location**. You pick it; it stays fixed while the sum runs.
- $a$ is the **dummy index**. It sweeps over every position in the image and never appears in the answer.
- $x - a$ is where the **kernel is sampled**. It is not a position in the image — it is a *distance*: how far the output point $x$ is from the image point $a$ we are currently reading.

#### What the formula is actually saying

To compute the output at $x$, visit every pixel $a$ in the image and ask two questions:

1. What is the value there? → $I(a)$
2. How far is it from $x$? Weight it accordingly → $f(x - a)$

So $f$ is a *weighting-by-distance* rule:

- $f(0)$ says how much a pixel counts when it sits right on top of $x$.
- $f(1)$ says how much it counts one step away in one direction; $f(-1)$ is one step the other way.

Since most of $f$ is zero, only a couple of pixels near $x$ actually contribute.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Local Difference as a Filter</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Take the local difference operator</p>

  $$I_{diff}(x) = \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1)$$

  <p style="margin: 10px 0;">The matching filter is</p>

  $$
    f(b) = \begin{cases}
    \phantom{-}1/2, & b = -1 \\
    -1/2, & b = 1 \\
    \phantom{-}0,   & \text{otherwise}
    \end{cases}
  $$

  <p style="margin: 10px 0 0 0;">Why these indices? In the sum $\sum_a I(a)\, f(x-a)$, the term multiplying $I(x+1)$ needs $x - a = -1$, so it is picked out by $f(-1)$. An offset of $+1$ in the image is read by $f(-1)$: <b>the kernel index is the negative of the offset.</b> That sign flip is the whole personality of convolution, and it is why the coefficients above look reversed relative to the formula for $I_{diff}$.</p>
</div>

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Local Average as a Filter</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Take the local average operator</p>

  $$I_{smooth}(x) = \tfrac{1}{4}I(x-1) + \tfrac{1}{2}I(x) + \tfrac{1}{4}I(x+1)$$

  <p style="margin: 10px 0;">The matching filter is</p>

  $$
    f(b) = \begin{cases}
    1/4, & b = -1 \\
    1/2, & b = 0 \\
    1/4, & b = 1 \\
    0,   & \text{otherwise}
    \end{cases}
  $$

  <p style="margin: 10px 0 0 0;">This filter is <b>symmetric</b> ($f(b) = f(-b)$), so the sign flip has no visible effect — the coefficients come out in the same order as the formula.</p>
</div>

One more example, going the other direction — from a convolution expression to its filter.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Reading Off a Filter</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Suppose a convolution is written as</p>

  $$f(x) * I(x) = -3\,I(x+2) + 4\,I(x+1) + 2\,I(x-2)$$

  <p style="margin: 10px 0;">Read off each coefficient, remembering that an offset of $+k$ maps to index $-k$:</p>

  $$
    f(b) = \begin{cases}
    -3, & b = -2 \\
    \phantom{-}4, & b = -1 \\
    \phantom{-}2, & b = 2 \\
    \phantom{-}0, & \text{otherwise}
    \end{cases}
  $$
</div>

#### Impulse function and impulse response

Here is the simplest convolution there is.

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Impulse Function</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">An <b>impulse function</b> has value 1 at a single pixel and 0 everywhere else. The impulse located at the origin is</p>

  $$
    \delta(x) = \begin{cases}
    1, & x = 0 \\
    0, & \text{otherwise}
    \end{cases}
  $$

  <p style="margin: 10px 0;">and the impulse located at $x = x_0$ is</p>

  $$
    \delta(x - x_0) = \begin{cases}
    1, & x = x_0 \\
    0, & \text{otherwise}
    \end{cases}
  $$
</div>

Convolving an impulse with any filter returns the filter unchanged:

$$\delta(x) * f(x) = f(x)$$

The one-line reason: $\displaystyle\sum_{a} \delta(a)\, f(x - a) = f(x - 0) = f(x)$, since $\delta(a)$ is zero for every $a \neq 0$.

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Impulse Response Function</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0;">Because $\delta(x) * f(x) = f(x)$, the filter $f(x)$ is exactly the output produced when the input is a single impulse at the origin. For this reason $f(x)$ is also called the <b>impulse response</b> of the filter.</p>
</div>

### Algebraic properties of convolution

If we pad functions with zeros so that they are defined on all the integers (rather than on a finite range, as in Matlab), we can prove some useful properties.

#### Property 1: commutative

$$I * f = f * I$$

**Proof.** Start from the definition:

$$I(x) * f(x) = \sum_{a=-\infty}^{\infty} I(a)\, f(x - a)$$

Substitute $b = x - a$, so $a = x - b$. As $a$ sweeps every integer, so does $b$ — in reverse order, which does not matter, since addition does not care about order. Replacing both pieces:

$$= \sum_{b=-\infty}^{\infty} I(x - b)\, f(b)$$

Multiplication commutes, so reorder the two factors:

$$= \sum_{b=-\infty}^{\infty} f(b)\, I(x - b) = f(x) * I(x) \qquad \blacksquare$$

#### Property 2: associative

$$I * (f_1 * f_2) = (I * f_1) * f_2$$

Applying two filters in sequence is the same as combining them into one filter first and applying that once. The grouping does not matter.

#### Property 3: distributive

$$(I_1 + I_2) * f = I_1 * f + I_2 * f$$

Filtering a sum equals summing the filtered pieces — convolution is **linear**. The proof is one line: expand $\sum_a \big(I_1(a) + I_2(a)\big) f(x - a)$ and split the sum. We leave it as an exercise.

## Cross-Correlation

We built convolution from

$$I(x) * f(x) \equiv \sum_{a} I(a)\, f(x - a)$$

and noticed that as we walk rightward through the image (larger $a$), we walk *leftward* through $f$, because the argument $x - a$ shrinks. That is the "flip."

### Cross-correlation, first form

Cross-correlation is what you get when you *don't* flip. That is the entire difference:

$$f(x) \otimes I(x) = \sum_{a} f(a)\, I(a + x)$$

Same three roles as before:

- $x$ is the **output location**, fixed while the sum runs.
- $a$ is the **dummy index**.
- $a + x$ is where the **image is sampled**: $a$ steps away from $x$.

Read it aloud: *to get the output at $x$, look at each offset $a$, weight the pixel $a$ steps away by $f(a)$, and add everything up.*

This is almost certainly the picture you already had when someone first said "slide a template across the image." $f(1)$ weights the pixel one step to the right; $f(-1)$ weights the pixel one step to the left. No reversal, no trap — the kernel's index *is* the direction you look. Cross-correlation is your intuition, written down.

### Cross-correlation, second form (where the flip lives)

There is an equivalent version. Substitute $b = a + x$, so $a = b - x$. As $a$ sweeps all integers, so does $b$. Swap both pieces:

- $f(a)$ becomes $f(b - x)$
- $I(a + x)$ becomes $I(b)$

$$f(x) \otimes I(x) = \sum_{b} f(b - x)\, I(b)$$

Now set it beside convolution, written with the same dummy variable:

$$
\begin{aligned}
\text{convolution:} \quad & \sum_{b} I(b)\, f(x - b) \\[4pt]
\text{cross-correlation:} \quad & \sum_{b} I(b)\, f(b - x)
\end{aligned}
$$

Identical except for the argument of $f$: $x - b$ versus $b - x$. One sign. That is the whole distinction.

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Convolution vs. Cross-Correlation</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">They differ by exactly one sign in the argument of $f$: $f(x - b)$ versus $f(b - x)$. Equivalently, convolution flips the kernel before sliding it; cross-correlation does not.</p>
  <p style="margin: 0;">If the kernel is <b>symmetric</b> ($f(b) = f(-b)$), the two operations give identical results. Every averaging filter we care about — including the Gaussian — is symmetric, so the distinction quietly disappears in practice and only bites you with asymmetric kernels such as derivative filters.</p>
</div>

## Gaussian Function

Local averaging needs weights. The $\tfrac{1}{4}, \tfrac{1}{2}, \tfrac{1}{4}$ we used earlier works, but it is ad hoc. The Gaussian is the standard, principled choice.

The 1D Gaussian is

$$G(x; \mu, \sigma) = \frac{1}{\sqrt{2\pi}\,\sigma}\; e^{-\frac{(x - \mu)^2}{2\sigma^2}}$$

In probability and statistics this is the *normal* distribution; in vision it is usually called the *Gaussian*, after the mathematician Gauss, who studied many of this function's properties.

For filtering we always center it at $\mu = 0$ (if no $\mu$ is given, assume $0$). Then:

- $\sigma$ is the only free parameter; it controls the width of the blur.
- $G(x) = G(-x)$, so the filter is symmetric — and by the previous box, convolving and cross-correlating with it are the same thing.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Why the Gaussian?</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <ul style="margin: 0; padding-left: 20px;">
    <li><b>Single lobe, no negative weights</b> — smoothing with no ringing artifacts.</li>
    <li><b>Symmetric</b> — does not shift features sideways.</li>
    <li><b>Separable</b> — a 2D Gaussian factors into a 1D Gaussian along $x$ times one along $y$, turning an $O(k^2)$ filter into two $O(k)$ passes.</li>
    <li><b>Closed under convolution</b> — a Gaussian convolved with a Gaussian is again a Gaussian, with $\sigma^2 = \sigma_1^2 + \sigma_2^2$. Blurring twice is just blurring once with a wider kernel.</li>
  </ul>
</div>

One subtlety. The continuous Gaussian integrates to 1 — the constant $\frac{1}{\sqrt{2\pi}\,\sigma}$ is there to guarantee it. But a filter is discrete: we sample $G$ at integer pixel offsets, and

$$\sum_{x \in \mathbb{Z}} G(x; 0, \sigma) \neq 1$$

in general. So in practice we sample the Gaussian over a finite window (commonly $|x| \le 3\sigma$) and then renormalize:

$$f(x) = \frac{G(x; 0, \sigma)}{\displaystyle\sum_{k} G(k; 0, \sigma)}$$

Now the weights sum to exactly 1, and the filter preserves average brightness — just like the hand-picked $\tfrac{1}{4}, \tfrac{1}{2}, \tfrac{1}{4}$, only with a principled shape behind it.

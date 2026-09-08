Last lecture we learned how to filter an image — slide a little weighted stencil across it and take linear combinations of nearby pixels. That was the toolbox. This lecture is the first real thing we build with it: a detector that finds the edges in an image.

It turns out "find the edges" is harder than it sounds, and the classical answer is a 30-year story of fixing one problem, noticing the fix broke something else, and fixing that. So let's walk it.

<details style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: sans-serif;">
  <summary style="font-weight: bold; cursor: pointer; font-size: 1.1em;">Table of Contents</summary>
  <ul style="margin-top: 16px; line-height: 1.8;">
    <li><a href="#motivation" style="text-decoration: none; color: #333;">Motivation</a></li>
    <li><a href="#what-a-filter-really-is-linear-shift-invariant-systems" style="text-decoration: none; color: #333;">What a Filter Really Is: Linear Shift-Invariant Systems</a></li>
    <li><a href="#first-try-threshold-a-local-difference" style="text-decoration: none; color: #333;">First Try: Threshold a Local Difference</a></li>
    <li><a href="#fixing-orientation-the-gradient-magnitude" style="text-decoration: none; color: #333;">Fixing Orientation: the Gradient Magnitude</a></li>
    <li><a href="#prewitt-and-sobel" style="text-decoration: none; color: #333;">Prewitt and Sobel</a></li>
    <li><a href="#fixing-thickness-the-second-derivative" style="text-decoration: none; color: #333;">Fixing Thickness: the Second Derivative</a></li>
    <li><a href="#derivative-meets-gaussian" style="text-decoration: none; color: #333;">Derivative Meets Gaussian</a></li>
    <li><a href="#into-2d-derivative-of-gaussian-and-the-laplacian" style="text-decoration: none; color: #333;">Into 2D: Derivative of Gaussian and the Laplacian</a></li>
    <li><a href="#why-the-laplacian-catches-every-orientation" style="text-decoration: none; color: #333;">Why the Laplacian Catches Every Orientation</a></li>
    <li><a href="#marr-hildreth-edge-detection-1979" style="text-decoration: none; color: #333;">Marr-Hildreth Edge Detection (1979)</a></li>
    <li><a href="#whats-next-canny-and-colour" style="text-decoration: none; color: #333;">What's Next: Canny, and Colour</a></li>
    <li><a href="#summary" style="text-decoration: none; color: #333;">Summary</a></li>
  </ul>
</details>

# Edge Detection

## Motivation

Why spend a whole lecture finding edges? Because an edge map is a compact, high-value summary of an image. Two big uses:

1. **Object boundaries.** The outline of an object tells you a lot — you can recognize a shape from its 2D silhouette, and you can start to estimate how the scene is laid out in depth.
2. **Matching features across images.** Edges are distinctive local landmarks, so they're natural things to match from one image to another: the same physical edge seen by a left and a right eye (binocular stereo), or by consecutive video frames (image motion).

As a target to keep in mind: a good modern detector like **Canny** turns a messy photo into a clean line drawing — thin, connected contours, few spurious specks. Everything below is us trying to earn that picture.

## What a Filter Really Is: Linear Shift-Invariant Systems

Before designing an edge detector, it helps to know exactly what class of operations "filtering" gives us. Filtering is a **linear shift-invariant (LSI) system**, and LSI systems have a beautiful restriction: there is essentially only one of them per impulse response.

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Linear System (Superposition)</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">A system that maps an input signal to an output signal is <b>linear</b> if it satisfies both:</p>
  <p style="margin: 0 0 10px 0;"><b>Additivity.</b> If $I_1 \mapsto O_1$ and $I_2 \mapsto O_2$, then $I_1 + I_2 \mapsto O_1 + O_2$.</p>
  <p style="margin: 0 0 10px 0;"><b>Homogeneity.</b> If $I_1 \mapsto O_1$, then $a\,I_1 \mapsto a\,O_1$ for any (complex) constant $a$.</p>
  <p style="margin: 0;">Together these two are called <b>superposition</b>: the response to a combination of inputs is the same combination of their responses.</p>
</div>

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Shift (Time) Invariance</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0;">A system is <b>shift invariant</b> if shifting the input just shifts the output by the same amount, without changing its shape: if $I_1(x) \mapsto O_1(x)$, then $I_1(x - u) \mapsto O_1(x - u)$. For images, "shift" is a spatial translation — the detector should behave the same in the top-left corner as in the middle.</p>
</div>

Here is the payoff, and it's why we spent the last lecture on convolution:

<div style="background-color: #f5f0fa; border-left: 4px solid #8e44ad; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #8e44ad;">
    <span>❗</span>
    <strong>Important Takeaway: an LSI System <i>is</i> a Convolution</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #dcd0e8; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">A linear shift-invariant system is <b>completely characterized by its impulse response</b> $h(x)$ — the output it produces when fed a single impulse $\delta(x)$. For any input $I(x)$ whatsoever, the output is</p>

$$h(x) * I(x) \;\equiv\; \sum_{u} h(x - u)\, I(u).$$

  <p style="margin: 0;">Any input is a sum of scaled, shifted impulses; linearity says the output is the same sum of scaled, shifted copies of $h$. So "designing an edge detector" reduces to <b>designing the right filter</b> $h$.</p>
</div>

## First Try: Threshold a Local Difference

The crudest possible edge detector. Take the finite-difference filter $[1, 0, -1]$ defined on $x \in \{-1, 0, 1\}$, run it over the image, and call a location an edge if the response is large:

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Threshold-Based 1D Edge Detection</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Given an image $I(x)$, mark $x$ as an edge whenever</p>

$$\big|\, I(x+1) - I(x-1) \,\big| \;>\; \tau$$

  <p style="margin: 0;">where $\tau$ is an arbitrary <b>threshold</b>. Big jump in intensity across a two-pixel window $\Rightarrow$ edge.</p>
</div>

Now apply that to a real 2D image the naive way — run it independently along each row. Two things go wrong.

<div style="background-color: #fcf3f3; border-left: 4px solid #d32f2f; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #d32f2f;">
    <span>⚠️</span>
    <strong>Watch Out: Two Failures of the Naive 1D Detector</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #f0d0d0; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;"><b>1. It misses horizontal edges.</b> A purely horizontal edge has no intensity change <i>along</i> a row, so a row-wise difference sees nothing. You only detect edges that happen to cross the direction you're differencing.</p>
  <p style="margin: 0;"><b>2. The edges come out thick</b> — many pixels wide — and the thickness depends on $\tau$. A gentle ramp in intensity exceeds the threshold over a whole band of pixels, not a single line, so "the edge" is a fat smear rather than a curve.</p>
</div>

So we have two concrete problems to solve: **orientation** (find edges running any direction) and **thickness** (localize each edge to one pixel). The rest of the lecture is two ideas — the gradient and the second derivative — that chip away at these.

## Fixing Orientation: the Gradient Magnitude

The orientation problem is fixed by not committing to a direction. Recall the **image gradient** from [image filtering](post.html?slug=image_filtering#image-derivatives-and-the-gradient):

$$\nabla I(x, y) \;\equiv\; \left( \frac{\partial I}{\partial x},\; \frac{\partial I}{\partial y} \right) \;\approx\; \left( \tfrac{1}{2}I(x{+}1, y) - \tfrac{1}{2}I(x{-}1, y),\;\; \tfrac{1}{2}I(x, y{+}1) - \tfrac{1}{2}I(x, y{-}1) \right)$$

The gradient has both an $x$ and a $y$ component, so it responds to a change in intensity in *any* direction. Its magnitude measures the steepness of that change regardless of orientation:

$$\|\nabla I(x, y)\| \;\equiv\; \sqrt{\left(\frac{\partial I}{\partial x}\right)^2 + \left(\frac{\partial I}{\partial y}\right)^2}$$

and the detector becomes: mark $(x, y)$ as an edge wherever $\|\nabla I(x, y)\| > \tau$. Horizontal edges now light up through the $\partial I / \partial y$ term, vertical edges through $\partial I / \partial x$, and diagonal edges through both.

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Aside: 3×3 gradient kernels instead of 1×3</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">There are many ways to write a gradient-like filter. Instead of a $1\times 3$ filter for $\partial / \partial x$ and a $3\times 1$ for $\partial / \partial y$, we can use $3\times 3$ kernels that difference in one direction while averaging in the other:</p>

$$\frac{\partial I(x,y)}{\partial x} \approx I(x,y) * \begin{bmatrix} 1 & 0 & -1 \\ 1 & 0 & -1 \\ 1 & 0 & -1 \end{bmatrix}, \qquad \frac{\partial I(x,y)}{\partial y} \approx I(x,y) * \begin{bmatrix} -1 & -1 & -1 \\ 0 & 0 & 0 \\ 1 & 1 & 1 \end{bmatrix}$$

  <p style="margin: 0;">The built-in averaging down each column makes the estimate less sensitive to noise than a bare $[1, 0, -1]$.</p>
</div>

## Prewitt and Sobel

Those two $3\times 3$ kernels are exactly the **Prewitt** edge detector (1970). **Sobel** (1968) uses the same idea with extra weight on the center row/column:

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Prewitt vs. Sobel Kernels</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;"><b>Prewitt (1970)</b> — plain averaging in the orthogonal direction:</p>

$$\partial_x:\; \begin{bmatrix} 1 & 0 & -1 \\ 1 & 0 & -1 \\ 1 & 0 & -1 \end{bmatrix} \qquad \partial_y:\; \begin{bmatrix} -1 & -1 & -1 \\ 0 & 0 & 0 \\ 1 & 1 & 1 \end{bmatrix}$$

  <p style="margin: 10px 0;"><b>Sobel (1968)</b> — the center row/column gets weight 2, a mild built-in smoothing:</p>

$$\partial_x:\; \begin{bmatrix} 1 & 0 & -1 \\ 2 & 0 & -2 \\ 1 & 0 & -1 \end{bmatrix} \qquad \partial_y:\; \begin{bmatrix} -1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1 \end{bmatrix}$$

  <p style="margin: 0;">To read these as a true gradient in units of "intensity change per pixel," you'd also multiply by a normalizing constant; for thresholded edge detection the scale just folds into the choice of $\tau$.</p>
</div>

Run Prewitt on a photo and threshold the gradient magnitude, and it's a real improvement: **edges of every orientation now show up**. But the result is still visibly **noisy** and the edges are still **thick** compared to a Canny output.

<div style="background-color: #f5f0fa; border-left: 4px solid #8e44ad; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #8e44ad;">
    <span>❗</span>
    <strong>Important Takeaway: Score Card So Far</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #dcd0e8; margin: 12px 0;">
  <p style="margin: 0;">Gradient-magnitude thresholding (Prewitt/Sobel) fixes <b>orientation</b> — done. It does <b>not</b> fix <b>thickness</b>: thresholding a broad hump of gradient magnitude still marks a band of pixels, not a one-pixel line. Two detectors fix both problems: <b>Marr &amp; Hildreth (1979)</b> and <b>Canny (1986)</b>.</p>
</div>

## Fixing Thickness: the Second Derivative

Here's the key idea for thin edges. The first derivative has a broad **peak** at an edge, and a peak is hard to pin down — thresholding it always grabs a fuzzy neighborhood. The second derivative, on the other hand, passes through **zero** at the peak of the first derivative, and a **zero-crossing is a single, precise location**.

The discrete second derivative is a difference of differences:

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Math Review: the Second-Difference Filter [1, −2, 1]</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Take a <b>forward difference</b> (an estimate of the derivative at $x + \tfrac{1}{2}$) and subtract a <b>backward difference</b> (the derivative at $x - \tfrac{1}{2}$):</p>

$$\frac{d^2 I(x)}{dx^2} \;\approx\; \big[\, I(x+1) - I(x) \,\big] - \big[\, I(x) - I(x-1) \,\big] \;=\; I(x+1) - 2\,I(x) + I(x-1)$$

  <p style="margin: 0;">That is convolution with the filter $[\,1,\; -2,\; 1\,]$. It measures curvature: zero on any straight ramp, nonzero only where the slope itself is changing.</p>
</div>

On a clean step edge, the three signals line up like this (dashed line = the edge location):

- $I(x)$ — a step up.
- $\dfrac{dI}{dx}$ — a single **hump**, whose **maximum** sits at the edge.
- $\dfrac{d^2I}{dx^2}$ — a positive lobe then a negative lobe, with a **zero-crossing** exactly at the edge.

<div style="background-color: #f5f0fa; border-left: 4px solid #8e44ad; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #8e44ad;">
    <span>❗</span>
    <strong>Important Takeaway: Localize by Zero-Crossing, not by Threshold</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #dcd0e8; margin: 12px 0;">
  <p style="margin: 0;">Edge location $\;\leftrightarrow\;$ <b>maximum of the first derivative</b> $\;\leftrightarrow\;$ <b>zero-crossing of the second derivative</b>. Detecting the zero-crossing gives you a thin edge "for free," because a sign change happens <i>between</i> two specific pixels rather than across a thresholded band.</p>
</div>

## Derivative Meets Gaussian

There's a catch. Second derivatives amplify high-frequency wiggles, so on a real (noisy) image the raw $[1, -2, 1]$ response is a mess. We have to **smooth first**. And smoothing, as always, blurs the edges along with the noise — so we use a **Gaussian** with standard deviation $\sigma$, which gives us one clean knob for "how much smoothing."

On a blurred (but noise-free) step edge, the chain still works: $I(x) \to G(x, \sigma) * I(x) \to \frac{d}{dx}(G * I)$ has a hump $\to \frac{d^2}{dx^2}(G * I)$ has a zero-crossing at the edge. Blurring widened everything but did not move the zero-crossing.

Now the elegant part. Recall convolution is **associative**, $f_1 * (f_2 * I) = (f_1 * f_2) * I$. Apply it with $f_1$ = "take a derivative":

$$\frac{d}{dx}\big( G(x, \sigma) * I(x) \big) \;=\; \frac{d\,G(x, \sigma)}{dx} * I(x)$$

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Why this matters: precompute the filter once</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">"Smooth the image, then differentiate the result" needs two passes over the image. But differentiation is itself a convolution, so by associativity you can instead <b>differentiate the Gaussian once</b>, offline, and convolve the image with that single fixed filter — the <b>Derivative of Gaussian</b>. One pass, same answer.</p>
  <p style="margin: 0;">(For sampled images the derivative of $G$ is approximated by a local difference of the sampled Gaussian, e.g. $[1, 0, -1] * G$ or $[1, -2, 1] * G$.)</p>
</div>

The shapes are worth memorizing:

- $G(x, \sigma)$ — the familiar bump.
- $\dfrac{dG}{dx}$ — **odd**: one positive lobe, one negative lobe, zero at the center. Convolving with it estimates the smoothed first derivative.
- $\dfrac{d^2G}{dx^2}$ — a **"Mexican hat"**: a negative well in the middle flanked by two positive shoulders. Convolving with it estimates the smoothed second derivative.

## Into 2D: Derivative of Gaussian and the Laplacian

Everything lifts to images by doing it per axis. Using [the 2D Gaussian](post.html?slug=image_filtering#the-2d-gaussian) $G(x, y) = \frac{1}{2\pi\sigma^2} e^{-(x^2 + y^2)/2\sigma^2}$:

**First derivatives of the Gaussian** (each is a 1D difference applied to $G$):

$$\frac{\partial G(x, y, \sigma)}{\partial x} \approx \begin{bmatrix} 1 & 0 & -1 \end{bmatrix} * G(x, y, \sigma), \qquad \frac{\partial G(x, y, \sigma)}{\partial y} \approx \begin{bmatrix} -1 \\ 0 \\ 1 \end{bmatrix} * G(x, y, \sigma)$$

Each looks like a bright blob sitting next to a dark blob; convolving the image with the pair gives the **gradient of the smoothed image**, $\nabla\big(G(x, y, \sigma) * I(x, y)\big)$.

**Second derivatives of the Gaussian:**

$$\begin{bmatrix} 1 & -2 & 1 \end{bmatrix} * G(x, y) \approx \frac{\partial^2 G(x, y)}{\partial x^2}, \qquad \begin{bmatrix} 1 \\ -2 \\ 1 \end{bmatrix} * G(x, y) \approx \frac{\partial^2 G(x, y)}{\partial y^2}$$

Add the two second partials and you get the **Laplacian**:

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Laplacian Operator</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">The <b>Laplacian</b> of an image is the sum of its unmixed second partial derivatives:</p>

$$\nabla^2 I(x, y) \;\equiv\; \frac{\partial^2 I(x, y)}{\partial x^2} + \frac{\partial^2 I(x, y)}{\partial y^2}$$

  <p style="margin: 0;">It is a single scalar per pixel, and (unlike the gradient) it points in no direction — a property we're about to exploit. Also written $\Delta I$.</p>
</div>

Combine "smooth with a Gaussian" and "take the Laplacian" into one filter — the **Laplacian of a Gaussian (LoG)**:

$$\nabla^2 G(x, y, \sigma) \;\equiv\; \frac{\partial^2 G}{\partial x^2} + \frac{\partial^2 G}{\partial y^2} \;=\; -\frac{1}{\pi\sigma^4}\left(1 - \frac{x^2 + y^2}{2\sigma^2}\right) e^{-\frac{x^2 + y^2}{2\sigma^2}}$$

It's the 2D "Mexican hat": a round negative well with a positive rim, and — crucially — it is **radially symmetric**.

## Why the Laplacian Catches Every Orientation

This is the clever bit that makes Marr-Hildreth work. Take a **vertical** image edge, so $I(x, y)$ depends only on $x$. Then $G(x, y, \sigma) * I(x, y)$ also depends only on $x$, so its derivative in the $y$ direction is zero, and

$$\nabla^2 G(x, y, \sigma) * I(x, y) \;\equiv\; \frac{\partial^2 (G * I)}{\partial x^2} + \underbrace{\frac{\partial^2 (G * I)}{\partial y^2}}_{=\,0} \;=\; \frac{\partial^2 (G * I)}{\partial x^2}$$

which is exactly the 1D case — a **zero-crossing right at the edge**. A **horizontal** edge is the mirror image: only the $\partial^2 / \partial y^2$ term survives, and you get a zero-crossing along the edge.

<div style="background-color: #f5f0fa; border-left: 4px solid #8e44ad; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #8e44ad;">
    <span>❗</span>
    <strong>Important Takeaway: One Isotropic Filter for All Orientations</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #dcd0e8; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Because $\nabla^2 G(x, y, \sigma)$ is <b>radially symmetric</b>, $\nabla^2 G * I$ has a zero-crossing along an edge of <b>any</b> orientation — not just horizontal and vertical. You get orientation-independence from a single filter, with no need to compute a whole fan of directional derivatives.</p>
  <p style="margin: 0;">This works because the Laplacian $\Delta$ is <b>rotationally invariant</b>: it equals the sum of second partials along <i>any</i> pair of locally orthogonal directions (we use $x$ and $y$ for convenience). The theoretical justification assumes intensity varies roughly linearly in the neighborhood of an edge.</p>
</div>

## Marr-Hildreth Edge Detection (1979)

Put it together and the algorithm is one line:

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: The Marr-Hildreth Detector</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Given an image $I(x, y)$ and a scale $\sigma$:</p>
  <p style="margin: 0 0 10px 0;">1. Compute $\;\nabla^2 G(x, y, \sigma) * I(x, y)\;$ (one convolution with the LoG filter).</p>
  <p style="margin: 0;">2. The edges are the points $(x, y)$ where that response has a <b>zero-crossing</b>.</p>
</div>

Both original problems are solved: the LoG's radial symmetry handles **any orientation**, and detecting a sign change localizes each edge to **one pixel**.

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Historical note: "Theory of Edge Detection" (Marr &amp; Hildreth, 1979)</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0;">The 1979 paper was influential for showing (a) how to detect edges of arbitrary orientation with a single radially symmetric kernel, $\nabla^2 G = \Delta G$; (b) how to combine the zero-crossings of $\nabla^2 G$ computed at several different $\sigma$ values into one edge map; and (c) an argument — persuasive at the time — that this is roughly how edge detection works in the human visual system.</p>
</div>

## What's Next: Canny, and Colour

Marr-Hildreth is one of the two classical detectors that solve orientation and thinness; the other is **Canny (1986)** — the one whose clean output we held up as the target at the start. Canny keeps the "smooth with a Gaussian, then look at derivatives" recipe but localizes edges differently (non-maximum suppression along the gradient direction, plus hysteresis thresholding). This deck stops at Marr-Hildreth; Canny is the natural next step.

A quick note on **colour**: everything here assumed a single intensity channel. For colour you can either run edge detection on each of the R, G, B channels and try to merge the results, or convert to HSV and detect edges there.

## Summary

- **Filtering is a linear shift-invariant system**, and every such system is convolution with its impulse response — so building an edge detector means designing a filter.
- **Threshold a local difference** is the naive detector: it misses edges not aligned with its differencing direction, and its edges are thick (thickness set by $\tau$).
- **Gradient magnitude** $\|\nabla I\| > \tau$ (Prewitt 1970, Sobel 1968, using $3\times 3$ kernels) fixes **orientation** but leaves edges noisy and thick.
- The **second derivative** replaces a fuzzy peak with a precise **zero-crossing**; the filter is $[1, -2, 1]$. Edge $\leftrightarrow$ max of 1st derivative $\leftrightarrow$ zero-crossing of 2nd derivative.
- Second derivatives need smoothing first; by **associativity** you fold the Gaussian and the derivative into one **Derivative-of-Gaussian** filter.
- The **Laplacian** $\nabla^2 I = \partial^2_x I + \partial^2_y I$ is a directionless scalar; the **Laplacian of a Gaussian** is radially symmetric, so its zero-crossings mark edges of **every** orientation.
- **Marr-Hildreth (1979)**: edges = zero-crossings of $\nabla^2 G(x, y, \sigma) * I(x, y)$. **Canny (1986)** solves the same two problems and comes next.

So, we are back to the very fundamentals.

Before transformers, computer vision ran on a handful of linear-algebra tricks for pushing pixels around. Image filtering is the first of them — edge detection, blob detection, SIFT, even a CNN's first layer are the same idea wearing a costume. Grab a coffee.

<details style="background-color: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: sans-serif;">
  <summary style="font-weight: bold; cursor: pointer; font-size: 1.1em;">Table of Contents</summary>
  <ul style="margin-top: 16px; line-height: 1.8;">
    <li><a href="#motivations" style="text-decoration: none; color: #333;">Motivations</a></li>
    <li><a href="#scenario-setup" style="text-decoration: none; color: #333;">Scenario Setup</a></li>
    <li><a href="#image-noise" style="text-decoration: none; color: #333;">Image Noise</a></li>
    <li><a href="#local-average-smoothing" style="text-decoration: none; color: #333;">Local Average (Smoothing)</a></li>
    <li><a href="#the-gaussian" style="text-decoration: none; color: #333;">The Gaussian</a></li>
    <li><a href="#local-difference" style="text-decoration: none; color: #333;">Local Difference</a></li>
    <li><a href="#from-two-operations-to-one-idea" style="text-decoration: none; color: #333;">From Two Operations to One Idea</a></li>
    <li><a href="#cross-correlation" style="text-decoration: none; color: #333;">Cross-Correlation</a></li>
    <li><a href="#convolution" style="text-decoration: none; color: #333;">Convolution</a></li>
    <li><a href="#impulse-function-and-impulse-response" style="text-decoration: none; color: #333;">Impulse Function and Impulse Response</a></li>
    <li><a href="#algebraic-properties-of-convolution" style="text-decoration: none; color: #333;">Algebraic Properties of Convolution</a></li>
    <li><a href="#boundaries-and-padding" style="text-decoration: none; color: #333;">Boundaries and Padding</a></li>
    <li><a href="#going-to-2d" style="text-decoration: none; color: #333;">Going to 2D</a></li>
    <li><a href="#image-derivatives-and-the-gradient" style="text-decoration: none; color: #333;">Image Derivatives and the Gradient</a></li>
    <li><a href="#summary" style="text-decoration: none; color: #333;">Summary</a></li>
  </ul>
</details>

# Image Filtering

## Motivations

Image filtering is a family of **local operations on an image**: look at a small neighborhood around each pixel, take a weighted combination of the values there, write the result back. Two jobs make it essential.

**Edge detection.** An edge is where intensity changes sharply — usually because something physical changes: a shadow boundary, a material change, an object's silhouette. Finding these is *edge detection*.

**Noise reduction.** Real cameras add noise that's roughly independent from pixel to pixel. To trust the edges we find, we need to calm that noise first.

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Edge</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">A position in an image where the intensity undergoes a large change in value.</p>
  <p style="margin: 0;">The computational problem of finding intensity edges in an image is called <i>edge detection</i>.</p>
</div>

To spot an edge, compare pixels in a neighborhood and look for a big change. To calm noise, blend a neighborhood together. Both are **linear combinations of nearby intensities** — the two basic recipes are **local averages** and **local differences**.

## Scenario Setup

Two simplifications, kept for the whole lecture:

1. **One channel, not three.** RGB values at a pixel are heavily correlated, so vision typically develops the theory on a single gray-level channel: *intensity*.
2. **1D before 2D.** Real images are $I(x, y)$. Every core idea already shows up in a 1D "image" $I(x)$, so we start there and lift to 2D at the end.

The running goal: **detect edges in the presence of noise.**

## Image Noise

Take two photos of the same scene, from the same spot, nothing moving — and the two images still aren't equal.

![Two photos of the same desk scene from the same position, and the enhanced difference between their green channels](../../assets/img/coursenote/foundational_cv/image_filtering/image_noise.png)

*Left and middle: the same desk, photographed twice from the same spot. Right: the (contrast-enhanced) difference between the two green channels — white is positive, black is negative. If the camera were noiseless this image would be flat gray.*

That difference image is pure sensor noise: standard deviation ≈ **4.8 gray levels**, and — crucially — independent from pixel to pixel. That independence is what we're about to exploit.

## Local Average (Smoothing)

Natural images vary slowly from pixel to pixel, except at edges. Noise varies independently at every pixel. Replace each pixel with a **weighted average of its neighbors**, and the slow signal survives while the fast, independent jitter partly cancels:

$$I_{smooth}(x) \;\equiv\; \tfrac{1}{4}I(x+1) + \tfrac{1}{2}I(x) + \tfrac{1}{4}I(x-1)$$

The weights $\tfrac14, \tfrac12, \tfrac14$ are a choice, not a law — $\tfrac13, \tfrac13, \tfrac13$ works too. The one hard constraint: **weights sum to 1**, or the operation brightens or darkens the image on top of smoothing it.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Smoothing a Noisy Flat Signal</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Let $I(x) = 100 + \text{noise}$, independent zero-mean jitter around a flat signal. $I_{smooth}$ mixes each pixel with its two neighbors; since the noise is independent and zero-mean, it partly cancels — the result stays near $100$ with visibly smaller wiggle.</p>
  <p style="margin: 0;">At the two ends, a tool like Matlab treats $I(x)$ as $0$ outside its domain, so the average there blends in a phantom $0$ and dips toward zero. That's a boundary artifact, not real smoothing — see <a href="#boundaries-and-padding" style="color:#227ac2;">Boundaries and Padding</a>.</p>
</div>

Now watch what smoothing does to a clean edge — no noise at all.

![A 1D image with a step edge: 16 pixels, gray values 20 and 100, jumping between pixel 8 and 9](../../assets/img/coursenote/foundational_cv/image_filtering/example_1_edge_with_no_noise.png)

*The test signal: a 1D image on 16 pixels taking values 20 and 100, with a step edge between $x=8$ and $x=9$. What happens if we take the local average?*

![The same step edge on the left; on the right, the result of the 1/4, 1/2, 1/4 local average, with the sharp step now spread over several pixels](../../assets/img/coursenote/foundational_cv/image_filtering/example_2_edge_with_noise_smoothing.png)

*Applying $I_{smooth}(x) \equiv \tfrac14 I(x+1) + \tfrac12 I(x) + \tfrac14 I(x-1)$: the step edge is smeared across several pixels (black circle). The red circles at the two ends are the same zero-padding boundary artifact from the box above.*

So smoothing is a trade.

<div style="background-color: #fcf3f3; border-left: 4px solid #d32f2f; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #d32f2f;">
    <span>⚠️</span>
    <strong>Watch Out: Smoothing Also Blurs the Signal</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #f0d0d0; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Averaging can't tell noise from a real edge — it applies the same blur everywhere. Kill more noise and you soften more edges; that tension is why edge detection is hard.</p>
  <p style="margin: 0;">Also: the local average is <b>undefined at the first and last pixel</b>, because one neighbor falls off the image.</p>
</div>

Widen the neighborhood for stronger smoothing:

$$I_{smooth}(x) \;\equiv\; \tfrac{3}{16}I(x+1) + \tfrac{1}{2}I(x) + \tfrac{3}{16}I(x-1) + \tfrac{1}{16}I(x+2) + \tfrac{1}{16}I(x-2)$$

— still sums to 1. But now: **how do we choose the weights?** Picking fractions by hand doesn't scale.

## The Gaussian

The standard answer is the **Gaussian**. In 1D, with mean $\mu$ and standard deviation $\sigma$:

$$G(x; \mu, \sigma) \;=\; \frac{1}{\sqrt{2\pi}\,\sigma}\; e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

For smoothing we center it, $\mu = 0$. That leaves **$\sigma$ as the only knob**, controlling the width of the blur. The leading constant is a normalizer that makes the continuous Gaussian integrate to 1.

In probability this is the *normal* distribution; in vision it's the *Gaussian*, after Gauss.

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Why this shape? (a Central Limit Theorem aside)</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Let $X_1, X_2, \dots, X_n$ be i.i.d. with mean $\mu$ and variance $\sigma^2$. The CLT says their (recentered, rescaled) average converges in distribution to a Gaussian — <b>whatever the original distribution was</b>.</p>
  <p style="margin: 0;">So the Gaussian is the natural "shape of an average." Building a smoothing filter — literally a weighted average of pixels — means reaching for the distribution averaging converges to anyway.</p>
</div>

Two practical notes:

- **Discrete renormalization.** The continuous Gaussian integrates to 1, but sampled at integer pixel offsets it generally does not. Sample $G$ over a finite window and divide by the sum.
- **Reused later.** Gaussians return when we discuss scale space.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Building a 3-Tap Gaussian Filter by Hand</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Take $\sigma = 1$, $\mu = 0$. The formula collapses to $G(x) \propto e^{-x^2/2}$, so we only need it at the three offsets:</p>
  <p style="margin: 10px 0; text-align: center;">$x = 0:\; e^{0} = 1 \qquad x = \pm 1:\; e^{-1/2} \approx 0.607$</p>
  <p style="margin: 10px 0;">Raw weights $[\,0.607,\; 1,\; 0.607\,]$ sum to $2.214 > 1$ — used as-is they'd brighten the image. Divide each by $2.214$:</p>
  <p style="margin: 10px 0; text-align: center;">$f \approx [\,0.274,\; 0.452,\; 0.274\,] \qquad (\text{sums to } 1)$</p>
  <p style="margin: 10px 0;">Apply it to a bright spike in a dark row, pixels $[\,100,\; 200,\; 100\,]$ — a dot product:</p>
  <p style="margin: 10px 0; text-align: center;">$0.274(100) + 0.452(200) + 0.274(100) = 27.4 + 90.4 + 27.4 = 145.2$</p>
  <p style="margin: 0;">The spike at $200$ got pulled down to $145.2$; its neighbors would be pulled up. The bump is smoothed, exactly as intended.</p>
</div>

<div style="background-color: #f5f0fa; border-left: 4px solid #8e44ad; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #8e44ad;">
    <span>❗</span>
    <strong>Important Takeaway: σ Controls the Trade-off</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #dcd0e8; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Turning $\sigma$ up makes the bell <b>shorter and wider</b>: weight drains off the center pixel toward farther neighbors.</p>
  <p style="margin: 0;">Effect: you <b>reduce noise more</b> (averaging more independent samples) but also <b>blur the signal more</b>, softening real edges. Every smoothing decision in vision is a choice of $\sigma$ on this axis.</p>
</div>

## Local Difference

Smoothing kills the fast stuff. Edge detection wants the opposite: **enhance** where intensity changes fast.

The tool approximates the first derivative, the **central difference**:

$$\frac{dI(x)}{dx} \;\approx\; I_{diff}(x) \;=\; \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1)$$

*Central* because it's symmetric about $x$ — one step each way, never at $x$ itself.

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Math Review: why is that a derivative?</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">The derivative of a continuous function has a symmetric form:</p>

$$f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x-h)}{2h}$$

  <p style="margin: 10px 0;">An image is discrete, so the smallest step is one pixel: set $h = 1$ and drop the limit.</p>

$$f'(x) \approx \frac{I(x+1) - I(x-1)}{2} = \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1)$$

  <p style="margin: 10px 0 0 0;">Why symmetric instead of the one-sided $I(x+1) - I(x)$? Its Taylor error is $O(h)$; the symmetric version cancels that term and is $O(h^2)$. It also stays centered on $x$, so it doesn't shift edges sideways.</p>
</div>

Reading the output:

- A large **positive** $I_{diff}(x)$ means an edge going **low &rarr; high**.
- A large **negative** $I_{diff}(x)$ means an edge going **high &rarr; low**.

A step edge is a cliff; the derivative of a cliff is a spike. Find the spikes, find the edges.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Local Difference on a Step Edge</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">A 1D image with a single edge at $x = x_0$:</p>

$$I(x) = \begin{cases} 100, & x > x_0 \\ 70, & x = x_0 \\ 40, & x < x_0 \end{cases}$$

  <p style="margin: 10px 0;">Applying $I_{diff}(x) = \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1)$:</p>

$$I_{diff}(x) = \begin{cases} 0, & x > x_0 + 1 \\ 15, & x = x_0 + 1 \\ 30, & x = x_0 \\ 15, & x = x_0 - 1 \\ 0, & x < x_0 - 1 \end{cases}$$

  <p style="margin: 10px 0 0 0;">The response peaks in absolute value <b>exactly at the edge</b>, and is zero in the flat regions.</p>
</div>

Like the local average, $I_{diff}(x)$ is **undefined at the first and last pixel**. More generally: take higher-order derivatives, chain a smoothing step with a difference step, or combine into any local linear combination.

## From Two Operations to One Idea

Put the two operations side by side:

- **Local average:** $I_{smooth}(x) = \tfrac{1}{4}I(x+1) + \tfrac{1}{2}I(x) + \tfrac{1}{4}I(x-1)$
- **Local difference:** $I_{diff}(x) = \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1)$

Both take a small neighborhood and return a **fixed-weight linear combination** — a linear map. Treating $I$ as an $N$-dimensional vector, that map is an $N \times N$ matrix. Almost every entry is zero, and the nonzero ones repeat: the same little stencil, shifted down the diagonal.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: The Local Average as a Matrix</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">For a 5-pixel image, $I_{smooth} = M\,I$ with:</p>

$$
\begin{bmatrix} I_{smooth}(1) \\ I_{smooth}(2) \\ I_{smooth}(3) \\ I_{smooth}(4) \\ I_{smooth}(5) \end{bmatrix}
=
\begin{bmatrix}
\tfrac12 & \tfrac14 & 0 & 0 & 0 \\
\tfrac14 & \tfrac12 & \tfrac14 & 0 & 0 \\
0 & \tfrac14 & \tfrac12 & \tfrac14 & 0 \\
0 & 0 & \tfrac14 & \tfrac12 & \tfrac14 \\
0 & 0 & 0 & \tfrac14 & \tfrac12
\end{bmatrix}
\begin{bmatrix} I(1) \\ I(2) \\ I(3) \\ I(4) \\ I(5) \end{bmatrix}
$$

  <p style="margin: 10px 0;">Row 3 reads off $\tfrac14 I(2) + \tfrac12 I(3) + \tfrac14 I(4)$ — exactly $I_{smooth}(3)$. The $[\tfrac14, \tfrac12, \tfrac14]$ stencil just slides one column over per row (a <b>banded</b>, or <i>Toeplitz</i>, matrix).</p>
  <p style="margin: 0;">Rows 1 and 5 are lopsided — the missing neighbor (say, $I(0)$) is dropped rather than written in, which is exactly <b>zero-padding</b>. Notice those rows sum to $\tfrac34$, not $1$: that's the boundary-darkening problem from before, now visible directly in the matrix.</p>
</div>

Writing this matrix out again for every new stencil is wasteful, and it hides the one fact that matters: each weight depends only on the **offset** between two pixels, not on where they sit. **Convolution** (and its near-twin **cross-correlation**) is the compact notation for exactly that. Cross-correlation first, since it matches intuition; convolution next, since it has the nicer algebra.

## Cross-Correlation

$$f(x) \otimes I(x) \;\equiv\; \sum_{u} f(u - x)\, I(u)$$

Place a copy of $f$ at $x$, slide $u$ over the image, and sum image values weighted by $f$ — a **dot product** between the filter and the patch of pixels underneath it. **No sign flip**: offset $+1$ into the image is read by $f(+1)$. The filter's index *is* the direction you look.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Cross-Correlation, Numerically</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Let $I = [\,10,\ 20,\ 30,\ 40,\ 50\,]$ at $x = 1,\dots,5$, and a filter $f(-1)=1,\; f(0)=2,\; f(1)=3$ — written left to right, $f = [\,1,\ 2,\ 3\,]$.</p>
  <p style="margin: 0 0 10px 0;">At $x=3$ the neighborhood is $I(2), I(3), I(4) = 20, 30, 40$. Cross-correlation reads $f$ exactly as given against that patch:</p>

$$f(x)\otimes I(x)\big|_{x=3} \;=\; f(-1)I(2) + f(0)I(3) + f(1)I(4) \;=\; 1(20) + 2(30) + 3(40) \;=\; 200$$

  <p style="margin: 0;">That's the dot product of $[1, 2, 3]$ with the patch $[20, 30, 40]$, in that order — <b>what you see is what you get.</b></p>
</div>

Equivalently (substitute $u = a + x$): $f(x) \otimes I(x) = \sum_a f(a)\, I(a+x)$ — weight the pixel $a$ steps from $x$ by $f(a)$.

## Convolution

$$f(x) * I(x) \;\equiv\; \sum_{u} f(x - u)\, I(u)$$

One sign different from cross-correlation — $f(x-u)$ instead of $f(u-x)$ — but the picture flips. Convolution **sums shifted copies of $f$**, each weighted by an image value:

$$f(x) * I(x) = \cdots + f(x{+}1)\,I({-}1) + f(x)\,I(0) + f(x{-}1)\,I(1) + f(x{-}2)\,I(2) + \cdots$$

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Convolution, Same Numbers</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Same $I = [10, 20, 30, 40, 50]$, same $f = [1, 2, 3]$, same position $x=3$, same patch $[20, 30, 40]$ — but now $f$ is read <b>backwards</b>:</p>

$$f(x) * I(x)\big|_{x=3} \;=\; f(1)I(2) + f(0)I(3) + f(-1)I(4) \;=\; 3(20) + 2(30) + 1(40) \;=\; 160$$

  <p style="margin: 0 0 10px 0;">That's the dot product of the <b>flipped</b> filter $[3, 2, 1]$ with the same patch $[20, 30, 40]$.</p>
  <table style="width:100%; border-collapse:collapse; margin:10px 0 0 0; font-size:0.95em;">
    <tr>
      <th style="text-align:left; padding:4px 10px 4px 0; border-bottom:1px solid #22c27d;">Operation</th>
      <th style="text-align:left; padding:4px 10px; border-bottom:1px solid #22c27d;">Filter vs. patch $[20,30,40]$</th>
      <th style="text-align:left; padding:4px 0 4px 10px; border-bottom:1px solid #22c27d;">Result</th>
    </tr>
    <tr>
      <td style="padding:4px 10px 4px 0;">Cross-correlation $f \otimes I$</td>
      <td style="padding:4px 10px;">$[1,2,3]$ (as given)</td>
      <td style="padding:4px 0 4px 10px;">$200$</td>
    </tr>
    <tr>
      <td style="padding:4px 10px 4px 0;">Convolution $f * I$</td>
      <td style="padding:4px 10px;">$[3,2,1]$ (flipped)</td>
      <td style="padding:4px 0 4px 10px;">$160$</td>
    </tr>
  </table>
  <p style="margin: 10px 0 0 0;">Same image, same patch, same nominal filter — the only difference is which direction $f$ is read. That's the entire distinction between the two operations.</p>
</div>

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Filter (Kernel)</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0;">Convolving an image $I(x)$ with a function $f(x)$ is called <b>filtering the image</b>. The function $f(x)$ is the <b>filter</b> (also called the <b>kernel</b>), understood to be $0$ outside the range where its weights are listed.</p>
</div>

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: Reading Off a Filter</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;"><b>Local difference</b> (asymmetric — the flip matters). $I_{diff}(x) = \tfrac{1}{2}I(x+1) - \tfrac{1}{2}I(x-1)$. In $\sum_u f(x-u)I(u)$: $I(x+1)$ needs $u=x+1 \Rightarrow$ weight $f(-1)$; $I(x-1)$ needs $f(+1)$. So $f(-1)=+\tfrac12$, $f(+1)=-\tfrac12$ — reversed relative to the formula.</p>
  <p style="margin: 0 0 10px 0;"><b>Local average</b> (symmetric — the flip is invisible). $f(-1) = f(1) = \tfrac14$, $f(0) = \tfrac12$; since $f(b)=f(-b)$, reading it forward or backward gives the same filter.</p>
  <p style="margin: 0;"><b>General rule.</b> An offset $+k$ in the convolution sum always maps to index $-k$ in $f$. So $f(x)*I(x) = -3\,I(x{+}2) + 4\,I(x{+}1) + 2\,I(x{-}2)$ has $f(-2)=-3,\; f(-1)=4,\; f(2)=2$.</p>
</div>

Any cross-correlation is a convolution with the flipped filter, and vice versa — same information, two conventions. Symmetric filters ($f(b) = f(-b)$, true of every averaging filter including the Gaussian) make the two operations **identical**; the distinction only bites for asymmetric filters like the derivative.

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Why bother flipping? A rubber-stamp picture</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Read $f$ as the <b>footprint you want stamped onto the output</b> — not as instructions for reading the input. Sliding a stencil across a signal <b>mirrors</b> it, like a rubber stamp: carve <b>CAT</b> into the rubber and it prints <b>TAC</b>. Cross-correlation carves normally and prints reversed. Convolution's $f(x-u)$ carves the stamp pre-flipped, so the sliding mirror flips it back and the page reads <b>CAT</b> — two flips make it forward.</p>
  <p style="margin: 0;">Confirm it on an impulse: $[1,2,3] * [0,1,0] = [1,2,3]$, an exact forward copy of the filter (why $f$ is called the <i>impulse response</i>). Cross-correlating the same two gives the reversed $[3,2,1]$.</p>
</div>

## Impulse Function and Impulse Response

The simplest possible input is a single spike.

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Impulse Function</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">An <b>impulse</b> has value 1 at one pixel and 0 everywhere else. At the origin:</p>

$$\delta(x) = \begin{cases} 1, & x = 0 \\ 0, & \text{otherwise} \end{cases}$$

  <p style="margin: 10px 0;">and shifted to $x_0$:</p>

$$\delta(x - x_0) = \begin{cases} 1, & x = x_0 \\ 0, & \text{otherwise} \end{cases}$$
</div>

Two facts fall straight out of the definition of convolution:

$$\delta(x) * I(x) = I(x) \qquad\text{and}\qquad \delta(x) * f(x) = f(x)$$

The first: $\sum_u \delta(x-u)\,I(u) = I(x)$, since $\delta(x-u)$ is zero unless $u = x$. The second is the same statement with $f$ in place of $I$.

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Impulse Response Function</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
  <p style="margin: 0;">Because $\delta(x) * f(x) = f(x)$, the filter $f(x)$ is literally the output when the input is a single impulse at the origin. For that reason a filter is also called the <b>impulse response function</b>.</p>
</div>

Here's the intuition that makes convolution click: **any image is a sum of shifted, scaled impulses**, one per pixel. Convolution is linear, so filtering the whole image equals filtering each impulse separately and summing the results — each impulse contributes one shifted, scaled copy of $f$. That is exactly what $\sum_u f(x-u)\,I(u)$ says: **stack up one impulse response per pixel.** Because every stamp lands forward-facing, chaining filters stays well-behaved — which is what powers the algebra next.

## Algebraic Properties of Convolution

If we pad both functions with zeros so they're defined on all integers, convolution obeys three laws (for arbitrary filters $f_1, f_2, f_3$).

**Commutative.** $f_1 * f_2 = f_2 * f_1$.

*Proof.* Start from $I(x) * f(x) = \sum_{u=-\infty}^{\infty} I(u)\, f(x - u)$. Substitute $b = x - u$; as $u$ ranges over all integers so does $b$, and

$$\sum_{b=-\infty}^{\infty} I(x - b)\, f(b) = \sum_{b=-\infty}^{\infty} f(b)\, I(x - b) = f(x) * I(x). \qquad \blacksquare$$

Zero-padding is what lets us run the sum from $-\infty$ to $\infty$ and reindex freely. **Cross-correlation does not have this property** — swapping the operands changes the result — except when $f$ is symmetric.

**Associative.** $(f_1 * f_2) * f_3 = f_1 * (f_2 * f_3)$. Applying two filters in sequence is the same as merging them into one filter first.

**Distributive.** $(f_1 + f_2) * f_3 = f_1 * f_3 + f_2 * f_3$. Filtering a sum equals summing the filtered pieces — convolution is linear.

<div style="background-color: #f5f0fa; border-left: 4px solid #8e44ad; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #8e44ad;">
    <span>❗</span>
    <strong>Important Takeaway: Why These Laws Matter</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #dcd0e8; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Vision pipelines chain filters — smooth, then differentiate. Associativity and commutativity mean <b>you can reorder and pre-combine those steps</b> without changing the answer, often saving computation.</p>
  <p style="margin: 0;">Distributivity handles noise cleanly: if $I_{\text{observed}} = I + n$, blurring-and-differentiating the observed image equals doing it to $I$ and $n$ separately and adding. You can reason about signal and noise <b>independently</b>.</p>
</div>

## Boundaries and Padding

$I(x)$ is typically defined on $0, \dots, N-1$ (or $1,\dots,N$ in Matlab), and $f(x)$ on a tiny range like $\{-1,0,1\}$. When the filter hangs off the edge of the image, some taps have no pixel to multiply.

The simplest fix is **zero-padding**: treat both functions as defined on all integers, $0$ wherever unspecified. This is exactly what produced the end-of-signal dips seen earlier — and the lopsided matrix rows above.

Computing a convolution of two finite vectors, there are three conventions for output size:

1. Pad with zeros, keep **every** relative position — output larger than the input.
2. Keep only positions where the output has the **same size** as the input.
3. Keep only positions where the shorter vector is **fully inside** the longer one — output smaller.

<div style="background-color: #fcf3f3; border-left: 4px solid #d32f2f; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #d32f2f;">
    <span>⚠️</span>
    <strong>Watch Out</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #f0d0d0; margin: 12px 0;">
  <p style="margin: 0;">Near the border, filtered values depend on your padding choice, not just the image. Zero-padding darkens edges; replicate, reflect, and wrap trade one artifact for another. There's no free lunch.</p>
</div>

*(Continuous convolution, $f * I \equiv \int f(x-u)\,I(u)\,du$, is defined by analogy; we won't need the continuous impulse function.)*

## Going to 2D

Everything lifts to images $I(x, y)$ by adding a second index.

$$
\begin{aligned}
\text{2D convolution:} \quad & f(x,y) * I(x,y) \equiv \sum_{u,v} f(x - u,\, y - v)\, I(u, v) \\[4pt]
\text{2D cross-correlation:} \quad & f(x,y) \otimes I(x,y) \equiv \sum_{u,v} f(u - x,\, v - y)\, I(u, v)
\end{aligned}
$$

Same two readings as in 1D: cross-correlation slides a 2D template and takes an inner product at each location; convolution sums the impulse responses contributed by every pixel.

### The 2D Gaussian

$$G(x, y; \sigma) \;=\; \frac{1}{2\pi\sigma^2}\; e^{-\frac{x^2 + y^2}{2\sigma^2}}$$

Three properties carry the weight:

- **Separable.** $G(x,y;\sigma) = G(x;\sigma)\,G(y;\sigma)$ — a 1D Gaussian in $x$ times one in $y$.
- **Radially symmetric.** Depends only on $x^2+y^2$, so it blurs equally in every direction.
- **Integrates to 1.** Because it's separable, the 2D integral splits into two 1D integrals, each equal to 1.

2D smoothing is $I_{smooth}(x, y) = G(x, y; \sigma) * I(x, y)$ — a local weighted average whose weights sum to 1.

<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>🧮</span>
    <strong>Example: The 3×3 Gaussian Kernel</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #22c27d; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Same recipe, one more axis. With $\sigma=1$ the weight at $(x,y)$ is proportional to $e^{-(x^2+y^2)/2}$:</p>
  <p style="margin: 10px 0; text-align: center;">center $(0,0)$: $e^{0}=1$ &nbsp;&bull;&nbsp; edges $(\pm1,0),(0,\pm1)$: $e^{-1/2}\approx0.607$ &nbsp;&bull;&nbsp; corners $(\pm1,\pm1)$: $e^{-1}\approx0.368$</p>

$$\text{raw} \;=\; \begin{bmatrix} 0.368 & 0.607 & 0.368 \\ 0.607 & 1.000 & 0.607 \\ 0.368 & 0.607 & 0.368 \end{bmatrix}$$

  <p style="margin: 0;">Corners are equal because squaring kills the sign — the 2D version of the Gaussian's symmetry. The nine entries sum to $\approx 4.90$; divide the whole grid by that to normalize. Then it's the same operation as before: lay the grid over a $3\times3$ patch, multiply the nine overlapping pairs, add them into <b>one</b> new pixel, slide.</p>
</div>

<div style="background-color: #f5f0fa; border-left: 4px solid #8e44ad; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #8e44ad;">
    <span>❗</span>
    <strong>Important Takeaway: Separability Is a Speedup</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #dcd0e8; margin: 12px 0;">
  <p style="margin: 0;">Because the 2D Gaussian is separable, blurring an $M\times M$ image with an $N$-wide kernel is a 1D horizontal pass followed by a 1D vertical pass: $O(NM^2)$ instead of $O(N^2M^2)$ for naive 2D convolution.</p>
</div>

## Image Derivatives and the Gradient

The 1D central difference generalizes to partial derivatives, one per axis:

$$
\frac{\partial I}{\partial x} \approx \tfrac{1}{2}I(x{+}1, y) - \tfrac{1}{2}I(x{-}1, y), \qquad
\frac{\partial I}{\partial y} \approx \tfrac{1}{2}I(x, y{+}1) - \tfrac{1}{2}I(x, y{-}1)
$$

Stack them into the **image gradient**:

$$\nabla I(x, y) \;\equiv\; \left( \frac{\partial I}{\partial x},\; \frac{\partial I}{\partial y} \right)$$

The gradient answers two questions at once: **which direction does intensity climb fastest, and how steep is that climb?** Its direction points up the steepest slope; its **magnitude**

$$\|\nabla I(x, y)\| \;=\; \sqrt{\left(\frac{\partial I}{\partial x}\right)^2 + \left(\frac{\partial I}{\partial y}\right)^2} \;\approx\; \tfrac{1}{2}\sqrt{\big(I(x{+}1,y) - I(x{-}1,y)\big)^2 + \big(I(x,y{+}1) - I(x,y{-}1)\big)^2}$$

is large exactly where the image has a strong edge — raw material for the edge detectors in the next lecture.

## Summary

- Filtering is a **linear map**: for a length-$N$ image, a sparse, banded $N\times N$ matrix (the same stencil down every row). Convolution and cross-correlation are the compact notation for it.
- **Local average** suppresses noise; **local difference** approximates the derivative and spikes at edges.
- The **Gaussian** is the principled smoothing weight; $\sigma$ trades noise reduction against blur.
- **Cross-correlation** ($\sum_u f(u-x)I(u)$, no flip) and **convolution** ($\sum_u f(x-u)I(u)$, filter flipped) differ by one sign; they agree when the filter is symmetric. Convolution is commutative, associative, and distributive.
- An **impulse** passes a filter through unchanged, which is why a filter is its own impulse response.
- Everything extends to **2D**; the Gaussian's separability makes 2D smoothing cheap, and the **image gradient** packages the two partial derivatives into a direction-and-steepness field.

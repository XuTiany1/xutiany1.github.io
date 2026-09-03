So, we are back to some very fundamental stuff. 

Which is kinda interesting to be honest, to get into the actual fundamentals of computer vision prior to the big LLM explosion.

Well, anyways, let's start. 

# Image Filtering

## Motivations
Essentially, image filtering is a set of operations performed on an image. 
We need image filtering because for two important tasks:
1. Edge detection: Edges are locations where image intensity undergoes a large change. Detecting them is crucial because they often mark where object properties change (i.e. shadow boundaries, material changes, ...)
2. Reduce image noise: Real-world images typically contain noise that is random/independent. This can suddenly spike intensity at specific random pixels. To alleviate this issue, we need filtering to smooth out the image and suppress this noise. 

## Scenario Setup
For the sake of learning, we will make two large simplifications:
1. Instead of the usual RGB(3 channels), we will concentrate on a single channel which we will call it "intensity"
2. Instead of 2D image `I(x,y)`, we will start with 1D images `I(x)`

For this blog, we will only consider the application of detecting image edges in the presence of image noise. 

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Edge</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
    <p style="margin: 0;"> A position in images where the intensity undergoes a large change in value.</p>
    <p style="margin: 0;"> The computational problem of finding intensity edges in images is called <i>edge detection</i>. </p>
</div>

To detect edges in an image, we will need to compare intensities of pixels in local neiborhoods and look for large change. 

There are two basic methods for doing so: local differences and local averages. 

## Local Difference

Consider a 1D image `I(x)`, where `x` means a specific location in this image. 

Then, an approximate of its derivative function is 
$$I_{diff}(x) = \frac{1}{2}I(x+1) - \frac{1}{2}I(x-1)$$

Wait why does this approximate its derivative function?

<div style="background-color: #e9eff9; border-left: 4px solid #227ac2; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #227ac2;">
    <span>➕</span>
    <strong>Math Review</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">By definition, for continuous function \( f(x) \) </p>
</div>

So, what does this tell us? 

Intuitively, think of $I_{diff}(x)$ is as the first derivative of the image. 

1. Large positive values for $I_{diff}(x)$ = an edge that goes from low-to-high intensity
2. Large negative value for $I_{diff}(x)$ = an edge that goes from high-to-low intensity 


<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>➕</span>
    <strong>Local Difference Example</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Consider an image that consists of a single edge at position $ x=x_0 $

  More preceisely, its defined as 
  $$
    I(x) = \begin{cases} 
    100, & x > x_0 \\ 
    70, & x = x_0 \\ 
    40, & x < x_0 
    \end{cases}
  $$

  Then, calculating its local difference, we will get the following function. 
  $$
    I_{diff}(x) = \begin{cases} 
    0, & x > x_0 + 1 \\ 
    15, & x = x_0 + 1 \\ 
    30, & x = x_0 \\ 
    15, & x = x_0 - 1 \\ 
    0, & x < x_0 - 1 
    \end{cases}
  $$

  Clearly, $ I_{diff}(x) $ has a maximum in the absolute value at the edge location. 
  </p>
</div>

Just a quick note. $I_{diff}(x)$ is not defined at the left/right boundary of the image. Many ways can handle this problem, we will return to this later. 

## Local Average

Real world images contain noise, and these noise are randomly spread. 

How can we reduce noise in an image?

One line of thought is that, image intensity tends to vary slowly from pixel to pixel (except at edges, of course). Then, we can reduce noise somewhat by smoothing out the image! 

Say, how about take the **local average** of the intensities? 

$$I_{smooth}(x) = \frac{1}{4}I(x-1) + \frac{1}{2}I(x)+ \frac{1}{4}I(x+1)$$

$\frac{1}{4}$, $\frac{1}{2}$, $\frac{1}{4}$ are arbitrary and can change. 

Note, similar to local difference, the left/right boundaries are not defined for local average. 


---

Now, look closely at the two operations we just learned:

- **Local difference**: $I_{diff}(x) = \frac{1}{2}I(x+1) - \frac{1}{2}I(x-1)$
- **Local average**: $I_{smooth}(x) = \frac{1}{4}I(x-1) + \frac{1}{2}I(x)+ \frac{1}{4}I(x+1)$

Notice what they have in common? Both operations take an image, look at a **local neighborhood** around a pixel, and compute a linear combination (multiplying nearby pixels by **fixed weights** and adding them up).  

This motivates discrete convolution!

---

## Discrete Convolution

Let's consider our image `I(x)` as an N dimensional vector. 

Then, both $I_{diff}(x)$ and $I_{smoth}(x)$ can be written as linear transformations(linear mappings) from `I(x)`. 

More importantly, one can represent those mappings by a `N x N` matrix. 

Even MORE importantly, the weights only care about nearby pixels (neighborhood relations). 

Hence, instead of writing out massive $N \times N$ matrices every time, mathematicians use a much easier tool called **convolution** (or cross-correlation). We will focus mostly on *convolution*

### Discrete Convolution for 1D
Consider image `I(x)`, filter `f(x)` (i.e. local difference/average).

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Filter</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
    <p style="margin: 0;"> The functions f(x) which convolve with the images are called filters. 
    We say that we are filtering the images with a filter f(x)
    </p>
</div>

Then, we define the convolution of `I(x)` with `f(x)` as 
$$I(x) * f(x) \equiv \sum_{a} I(a) f(x - a)$$

Take a minute with it before we do anything else, and observe:
- `x` is the output location. You pick it. It stays fixed while the sum runs.
- `a` is the dummy index. It sweeps over every position in the image. You never see it in the answer.
- `x - a` is where the kernel gets sampled. It's not a position in the image, it's a distance. measures how far the output point `x` is from the image point `a` we're currently reading.

#### What the formula is actually saying

To compute the output at position `x`, visit every pixel `a` in the image, and ask two questions:
1. What's the value there? → `I(a)`
2. How far is it from x? Weight it accordingly → `f(x-a)`

So `f` is a weighting-by-distance rule. 
- `f(0)` says how much a pixel counts when it sits right on top of x
- `f(1)` says how much it counts when it's one step away in a particular direction and `f(-1)` is one step the other way

Since most of `f` is zero, only a couple of pixels near `x` actually contribute.



<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>➕</span>
    <strong>Local Difference Discrete Convolution Example</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Consider our local difference operator.
  
  $$I_{diff}(x) = \frac{1}{2}I(x+1) - \frac{1}{2}I(x-1)$$
  
  Then the filter can be defined as:

  $$
    f(b) = \begin{cases} 
    1/2, & b = -1 \\ 
    -1/2, & b = 1 \\ 
    0, & otherwise
    \end{cases}
  $$

  Why does this make sense? Notice that we are using f(x) and not f(x-a)

  </p>
</div>

Now, let's consider the local average case. 


<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>➕</span>
    <strong>Local Average Discrete Convolution Example</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Consider our local average operator.
  
  $$I_{smooth}(x) = \frac{1}{4}I(x-1) + \frac{1}{2}I(x)+ \frac{1}{4}I(x+1)$$
  
  Then the filter can be defined as:

  $$
    f(b) = \begin{cases} 
    -1/4, & b = -1 \\ 
    1/4, & b = 1 \\ 
    1/2, & b=0 \\
    0, & otherwise
    \end{cases}
  $$

  Why does this make sense? Notice that we are using f(x) and not f(x-a)

  </p>
</div>

Now another example. 


<div style="background-color: #f4fbf8; border-left: 4px solid #22c27d; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em; color: #22c27d;">
    <span>➕</span>
    <strong>Another Discrete Convolution Example</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #227ac2; margin: 12px 0;">
  <p style="margin: 0 0 10px 0;">Consider a convolution phrased as 
  
  $$f(x)*I(x) = -3 I(x + 2) + 4 I(x + 1) + 2 I(x − 2)$$

  Then, we can simply read off the value and say the filter is defined as:

  $$
    f(b) = \begin{cases} 
    -3, & b = -2 \\ 
    4, & b = -1 \\ 
    2, & b = 2 \\
    0, & otherwise
    \end{cases}
  $$
  </p>
</div>


#### Impulse Function & Impulse Response Function

This is a very simple exapmle of a convolution

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Impulse Function</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
    <p style="margin: 0;"> 
    An impulse function is the case where the function I(x) has value 1 at a single pixel and 0 everywhere else. 
    <b>An impulse function located at 0</b> is defined as: 

 $$
    \delta(x) = \begin{cases} 
    1, & x = 0 \\ 
    0, & \text{otherwise} 
    \end{cases}
 $$

</p>
    <p style="margin: 0;"> and an impulse at location x = x_0 is:

$$
\delta(x - x_0) = \begin{cases} 
1, & x = x_0 \\ 
0, & \text{otherwise} 
\end{cases}
$$</p>
</div>

An interesting property is that **convolving the impulse function with any filter will result in the filter**!
$$ \delta(x) * f(x) = f(x) $$
For this reason, a filter f (x) is often called the impulse response function. It is the response to an impulse located at x = 0.

<div style="background-color: #f8f9fa; border-left: 4px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0; color: #333;">
  <div style="display: flex; align-items: center; gap: 8px; font-size: 1.1em;">
    <span>💡</span>
    <strong>Definition: Impulse Response Function</strong>
  </div>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 12px 0;">
<p style="margin: 0;"> 
Due to the property of 

$$ \delta(x) * f(x) = f(x) $$

where $ \delta(x) $ is called the impulse function. 

The filter f (x) is often called the impulse response function.
</p>

</div>


### Algebraic Properties of Convolution

If we consider convolution of functions which are padded with 0’s so that they defined on all the integers (as opposed to just being defined on some finite range as in the case of Matlab), then we can prove some important properties


#### Convolution Property 1: commutative
 
$$I * f = f * I$$
 
The proof
 
Start from the definition:
 
$$I(x) * f(x) = \sum_{a=-\infty}^{\infty} I(a)\, f(x - a)$$
 
Substitute `b = x - a`, so `a = x - b`. As `b` sweeps every integer, so does `a` — in reverse order, which doesn't matter, since addition doesn't care about order. Replace both pieces:
 
- `I(a)` becomes `I(x-b)`
- `f(x-a)` becomes `f(b)`
$$= \sum_{a=-\infty}^{\infty} I(x-b)\, f(b)$$
 
Now reorder the two factors, which is just multiplication being commutative:
 
$$= \sum_{a=-\infty}^{\infty} f(b)\, I(x-b)$$
 
Done. 


#### Convolution Property 2: associative
 
$$I * (f_1 * f_2) = (I * f_1) * f_2$$
 
Applying two filters in sequence is the same as combining them into one filter first and applying that once. The grouping doesn't matter.
 
#### Convolution Property 3: distributive
 
$$(I_1 + I_2) * f = I_1 * f + I_2 * f$$
 
Filtering a sum equals summing the filtered pieces. Convolution is **linear**.
 
The proof is one line once you write the sum out — the addition inside distributes over the multiplication — and the notes leave it as an exercise, correctly.





## Cross-Correlation

Above, we built up convolution from
 
$$I(x) * f(x) \equiv \sum_{a} I(a)\, f(x-a)$$
 
and we observe that as we walk rightward through the 1D image, we walkt leftward through `f` since `a` grows larger. 
 
### First form of cross-correlation
Cross-correlation is the operation you get when you *don't* flip. That's the entire difference. 
$$f(x) \otimes I(x) = \sum_{a} f(a)\, I(a+x)$$
 
Same three-role breakdown as before:
 
- **`x`** is the output location. Fixed while the sum runs.
- **`a`** is the dummy index 
- **`a + x`** is where the image gets sampled: `a` steps away from `x`.

Read it out loud: *to get the output at `x`, look at each offset `a`, weight the pixel `a` steps away by `f(a)`, and add everything up.*
 
This is almost certainly what you were already picturing when someone first said "slide a template across the image." `f(1)` weights the pixel one step to the right. `f(-1)` weights the pixel one step to the left. No reversal, no trap. The kernel's index *is* the direction you look.
 
That's why cross-correlation feels natural and convolution feels perverse. Cross-correlation is your intuition, written down.

### The second form of cross-correlation, and where the flip lives
 
The notes give an equivalent version. Substitute `b = a + x`, so `a = b - x`. As `a` sweeps all integers, so does `b`. Swap both pieces:
 
- `f(a)` becomes `f(b - x)`
- `I(a+x)` becomes `I(b)`
$$f(x) \otimes I(x) = \sum_{b} f(b-x)\, I(b)$$
 
Now put it beside convolution, written with the same dummy variable:
 
$$
\begin{aligned}
\text{convolution:} \quad & \sum_{b} I(b)\, f(x - b) \\[4pt]
\text{cross-correlation:} \quad & \sum_{b} I(b)\, f(b - x)
\end{aligned}
$$
 
Identical except for the argument of `f`: `x - b` versus `b - x`. One sign. That's the whole distinction between the two operations.
 




## Gaussian Function


Local averaging needs weights. We used `¼, ½, ¼` earlier which is fine, but arbitrary. The Gaussian is the standard choice, and here I will briefly mention some....

The function itself is defined as
 
$$G(x; \mu, \sigma) = \frac{1}{\sqrt{2\pi}\,\sigma}\, e^{-(x-\mu)^2 / 2\sigma^2}$$
 
When a Gaussian is used for local averaging, we set **`μ = 0`**. If no `μ` is given, assume 0.
- `μ = 0` for filtering. `σ` controls blur width.

Because `G(x) = G(-x)` when `μ = 0`, the Gaussian is symmetric.
 
The continuous Gaussian integrates to 1. That constant `1/(√(2π)σ)` guarantees it. But we don't get the continuous function. We sample it at integer pixel positions, and
 
$$\sum_{x \in \mathbb{Z}} G(x; 0, \sigma) \neq 1$$
 
in general. 

A Gaussian is often called “normal” distribution in probability and statistics, but in vision one typically uses the term “Gaussian” which refers to the mathematician Gauss who explored many of this functions properties. 
 








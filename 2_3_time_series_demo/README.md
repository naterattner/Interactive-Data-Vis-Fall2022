# Section 2 | Tutorial 3 | Time Series

The goals for this tutorial are:

- to reinforce the basic mechanics of how d3 allows you to [select](https://github.com/d3/d3-selection) HTML/SVG elements and map them to data elements.
- to reinforce [HTML svg](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg) coordinate system.
- to reinforce how [d3-scales](https://github.com/d3/d3-scale) can map abstract data elements to visual variables.
- to reinforce how to add axes to an svg using [d3-axis](https://github.com/d3/d3-axis).
- introduce [d3 line](https://github.com/d3/d3-shape#lines) generators, and solidify how a function generator works differently than the appending and manipulating elements we've done so far.
- to learn the tools to make your own line chart.

## Setup + Serve:

You should already have a local copy of your repository from the [tutorial 1](../1_1_getting_started/README.md). Start by getting a [basic server](../1_1_getting_started/3_BASIC_SERVER.md) up and running. This should include all the changes you've made thus far.

Once your local serve is up and reacting to code changes, you're ready to begin working on your tutorial assignment.
As you're building, don't forget you can always reference the [class code branch](https://github.com/InteractiveDataVis/Interactive-Data-Vis-Fall2022/tree/class/) or the [demo code branch](https://github.com/InteractiveDataVis/Interactive-Data-Vis-Fall2022/tree/demo/) for additional context.

## Assignment:

- [ ] Implement your own line chart _with a different dataset_ than the one used in our demo. Your data should only create one line (given then next requirement). 
- [ ] Turn this line chart into an [area chart](https://github.com/d3/d3-shape#areas). **Tip**: Think first about how that would be drawn on the screen. What are you creating on the svg? This requires referencing the d3 documention to understand the similarities and differences between the area function generator and the line function generator.
- [ ] Make intentional design decisions -- colors, sizes, axes, etc. should illustrate something interesting about or relevant to your data.

**BONUS:**

- [ ] Turn this single area chart into a [stacked area chart](https://observablehq.com/@d3/stacked-area-chart). How does this change what actually needs to be drawn?

## Deploy + Submit

Once you've completed the assignment, use the Github workflow to deploy your work to **your fork** of the course repository. Post the following as a comment to the appropriate post on the [commons site](https://data73200fall2022.commons.gc.cuny.edu/):
1. a link to your committed code repository (your link will look something like: `https://github.com/[YOUR_USERNAME]/Interactive-Data-Vis-Fall2022/[TUTORIAL_PATH]/`)
2. a link to your deployed example (your link will look something like: `https://[YOUR_USERNAME].github.io/Interactive-Data-Vis-Fall2022/[TUTORIAL_PATH]/`)




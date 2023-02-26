# Interactive Data Visualization: Final Project

## Prospectus

Americans formed new businesses in historic numbers during the pandemic. Monthly business applications spiked to the highest level on record in early 2020 and haven’t slowed since. 

I am to explore the U.S. Census Bureau’s [Business Formation Statistics data](https://www.census.gov/econ/bfs/index.html) in an effort to understand and explain who and what is driving this trend. This might include:

- Overall trends: What was the timing of when this trend took off, and how elevated are the current numbers relative to the pandemic peak?

- Business applications by industry: What types of companies are Americans starting? 

- Geographic trends: Where are these companies forming? Are there trends by region? More granularly, there is annual county-level data starting in 2005 which was recently released for 2021.

- Demographic trends: By combining the county-level business formations data with other Census data such on race and ethnicity, household income, and education levels, we might gain more insight into who is starting these new companies.

My initial idea is to do this as a sort of two-part dashboard. The first would be aimed at showing change-over-time data, to offer insight into the first two bullet points above (overall and industry trends). The second would be a map, which would both visualize trends and allow users to explore more granular data. Depending on what comes out of an initial exploration of the data, however, this project could turn into more of a story if a clear narrative emerges.


## Sketch
![Final project wireframe](https://github.com/naterattner/Interactive-Data-Vis-Fall2022/blob/main/final_project/imgs/final_project_wireframe.png)


## Project Plan
### Abstract
Americans formed new businesses in historic numbers during the pandemic. Monthly business applications spiked to the highest level on record in early 2020 and haven’t slowed since. 

This dashboard will allows users to explore the U.S. Census Bureau’s [Business Formation Statistics](https://www.census.gov/econ/bfs/index.html) data and better understand and explain who and what is driving this trend. Users will be able to view business formation data broken out by:  
- Total nationwide numbers
- Likelihood to employ workers
- U.S. region
- Industry

### Proposed site architecture
Init function for setup:
- Establish dashboard UI elements (buttons and dropdown filters)
- Establish chart elements that will not change: svg and x axis

State object contains:
- Data
- Selection (one of the four top-level categories)
- Highlight (one of the series within a category)

Category buttons will trigger a draw function to redraw y-axis and lines.

Highlight filter will select a line with d3 select and change its color. We may not need to redraw the entire chart here – can keep lines and axes as-is.

### Plan for dara analysis
I don’t plan to do any data analysis, but I will need to compile the various datasets I’m visualizing into a format that will work for the button filtering I’m proposing. This likely means a dataset with four columns: Date, Category, Series, and Value. With this structure, I can filter the dataset by category when the user clicks each top-level button on the dashboard, and draw a line for each series within that category.

My data is currently in “wide” format – with one column for each series – rather than the “long” format described above. I will use Python to reshape the data into the proper format.

The data export also contained a handful of “NA” values for months at the start and end of the dataset, which I’ll remove.

Note: This changed during build. I calculated the change from 2019 average for each series.

## Deployed project link
[Link](https://naterattner.com/Interactive-Data-Vis-Fall2022/final_project/index.html)


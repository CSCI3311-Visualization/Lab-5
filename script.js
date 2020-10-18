// CHART INIT ------------------------------

// create svg with margin convention
const margin = { top: 20, right: 20, bottom: 20, left: 40 };
const width = 650 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3
  .select('.chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom);

const group = svg
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// create scales without domains
const xScale = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
const yScale = d3.scaleLinear().range([height, 0]);

// create axes and axis title containers
const xAxis = d3.axisBottom().scale(xScale);
let xAxisGroup = group.append('g').attr('class', 'x-axis axis');

const yAxis = d3.axisLeft().scale(yScale);
let yAxisGroup = group.append('g').attr('class', 'y-axis axis');

let yAxisTitle = group.append('text').attr('class', 'axis-title');

// (Later) Define update parameters: measure type, sorting direction
let measureType = 'stores';
let descending = true;
const durationSpeed = 1000;

// CHART UPDATE FUNCTION -------------------
function update(data, type, desc) {
  if (desc) {
    data.sort((a, b) => b[type] - a[type]);
  } else {
    data.sort((a, b) => a[type] - b[type]);
  }
  console.log(type);
  const companies = data.map((d) => d.company);
  // Update scale domains
  xScale.domain(companies);
  yScale.domain([0, d3.max(data, (d) => d[type])]);

  const rects = group.selectAll('rect').data(data, (d) => d.company);

  // Implement the enter-update-exist sequence
  rects
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d.company))
    .attr('y', height)
    .attr('fill', 'magneta')
    .merge(rects)
    .transition()
    .duration(durationSpeed)
    .attr('x', (d) => xScale(d.company))
    .attr('y', (d) => yScale(d[type]))
    .attr('width', (d) => xScale.bandwidth())
    .attr('height', (d) => height - yScale(d[type]))
    .attr('fill', 'steelblue');

  rects
    .exit()
    .transition()
    .duration(durationSpeed)
    .attr('fill', '#EBEBEB')
    .attr('y', height)
    .remove();

  // Update axes and axis title
  xAxisGroup
    .attr('transform', 'translate(0,' + height + ')')
    .transition()
    .duration(durationSpeed - 400)
    .call(xAxis);

  yAxisGroup
    .transition()
    .duration(durationSpeed - 400)
    .call(yAxis);

  yAxisTitle
    .attr('x', -10)
    .attr('y', -10)
    .attr('dy', '.2em')
    .attr('font-size', 15)
    .style('text-anchor', 'start')
    .text(() => {
      if (type == 'stores') {
        return 'Stores';
      } else {
        return 'Billion USD';
      }
    });
}

// Loading data
d3.csv('coffee-house-chains.csv', d3.autoType).then((data) => {
  // First barchart Rendering
  update(data, measureType, descending);

  // (Later) Handling the type change
  d3.select('#group-by').on('change', (e) => {
    measureType = e.target.value;
    update(data, measureType, descending);
  });

  // (Later) Handling the sorting direction change
  d3.select('#sorting').on('click', () => {
    descending = !descending;
    update(data, measureType, descending);
  });
});

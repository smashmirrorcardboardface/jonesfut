'use strict';

let data = [];
const margin = {
    top: 40, right: 20, bottom: 50, left: 100
};

const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', graphWidth + margin.left + margin.right)
    .attr('height', graphHeight + margin.top + margin.bottom);

const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`);


const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

const xAxisGroup = graph.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g')
    .attr('class', 'y-axis');

const line = d3.line()
    .x(d => { return x(new Date(d.date)); })
    .y(d => { return y(d.distance); });

db.collection('activities').onSnapshot(res => {
    res.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), id: change.doc.id };

        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                const index = data.findIndex(item => { return item.id === doc.id; });

                data[index] = doc;
                break;
            case 'removed':
                data = data.filter(item => { return item.id !== doc.id; });
                break;
            default:
                break;
        }
    });
    update(data);
});


const path = graph.append('path');

//create dotted group
const dottedLine = graph.append('g')
    .attr('class', 'dottedLines')
    .style('opacity', 0);

// create dotted x & y lines
const dottedYLine = dottedLine.append('line').attr('stroke', 'grey')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4);

const dottedXLine = dottedLine.append('line').attr('stroke', 'grey')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', 4);


function update(data) {

    data = data.filter(item => { return item.activity === activity; });

    data.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    // console.log('data :', data);
    x.domain(d3.extent(data, d => { return new Date(d.date); }));
    y.domain([0, d3.max(data, d => { return d.distance; })]);

    path.data([data])
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('d', line);

    const circles = graph.selectAll('circle').data(data);

    circles.exit().remove();

    circles.enter().append('circle')
        .attr('r', 4)
        .attr('cx', d => { return x(new Date(d.date)); })
        .attr('cy', d => { return y(new Date(d.distance)); })
        .attr('fill', 'white');

    circles
        .attr('cx', d => { return x(new Date(d.date)); })
        .attr('cy', d => { return y(new Date(d.distance)); });

    graph.selectAll('circle')
        .on('mouseover', (event, d) => {
            d3.select(event.currentTarget)
                .transition().duration(100)
                .attr('r', 8);

            dottedXLine
                .attr('x1', x(new Date(d.date)))
                .attr('x2', x(new Date(d.date)))
                .attr('y1', y(graphHeight))
                .attr('y2', y(d.distance));
            dottedYLine
                .attr('x1', 0)
                .attr('x2', x(new Date(d.date)))
                .attr('y1', y(d.distance))
                .attr('y2', y(d.distance));

            dottedLine.style('opacity', 1);
        }).on('mouseout', event => {
            d3.select(event.currentTarget)
                .transition().duration(100)
                .attr('r', 4);
            dottedLine.style('opacity', 0);
        });

    const xAxis = d3.axisBottom(x)
        .ticks(4).tickFormat(d3.timeFormat('%b %d'));

    const yAxis = d3.axisLeft(y)
        .ticks(4).tickFormat(d => { return `${d} m`; });

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end');

}

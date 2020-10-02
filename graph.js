'use strict';

const dimensions = {
    height: 300, width: 300, radius: 150
};

const center = { x: dimensions.width / 2 + 5, y: dimensions.height / 2 + 5 };

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dimensions.width + 150)
    .attr('height', dimensions.height + 150);

const graph = svg.append('g')
    .attr('transform', `translate(${center.x},${center.y})`);

const pie = d3.pie()
    .sort(null)
    .value(d => { return d.cost; });

const arcPath = d3.arc()
    .outerRadius(dimensions.radius)
    .innerRadius(dimensions.radius / 2);

const colour = d3.scaleOrdinal(d3.schemeTableau10);

const legendGroup = svg.append('g').attr('transform', `translate(${dimensions.width + 40}, 10)`);

const legend = d3.legendColor().shape('circle').shapePadding(10).scale(colour);

const tip = d3
    .select('body')
    .append('div')
    .attr('class', 'card')
    .style('padding', '8px')
    .style('position', 'absolute')
    .style('left', 0)
    .style('top', 0)
    .style('visibility', 'hidden');

const update = data => {

    colour.domain(data.map(d => { return d.name; }));

    legendGroup.call(legend);
    legendGroup.selectAll('text').attr('fill', 'white');

    const paths = graph.selectAll('path')
        .data(pie(data));

    paths
        .attr('d', arcPath)
        .transition().duration(750).attrTween('d', arcTweenUpdate);

    paths.enter().append('path')
        .attr('class', 'arc')
        .attr('stroke', ' #fff')
        .attr('fill', d => { return colour(d.data.name); })
        .each(function(d) {
            this._current = d;
        })
        .transition().duration(750).attrTween('d', arcTweenEnter);

    paths.exit().transition().duration(750).attrTween('d', arcTweenExit).remove('path');

    graph.selectAll('path')
        .on('mouseover', (event, d) => {
            let content = `<div class="name">${d.data.name}</div>`;

            content += `<div class="cost">£${d.data.cost}</div>`;
            content += '<div class="delete">Click slice to delete</div>';

            tip.html(content).style('visibility', 'visible');
            handleMouseOver(event);
        })
        .on('mouseout', (event, d) => {
            tip.style('visibility', 'hidden');
            handleMouseOut(event, d);
        }).on('mousemove', event => {
            tip.style('transform', `translate(${event.pageX}px,${event.pageY}px)`);
        })
        .on('click', handleClick);

};

let data = [];

db.collection('expenses').onSnapshot(result => {
    result.docChanges().forEach(change => {
        const doc = { ...change.doc.data(), id: change.doc.id };

        switch (change.type) {
            case 'added':
                data.push(doc);
                break;
            case 'modified':
                data[data.findIndex(item => { return item.id === doc.id; })] = doc;
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

const arcTweenEnter = d => {
    const i = d3.interpolate(d.endAngle, d.startAngle);

    return t => {
        d.startAngle = i(t);

        return arcPath(d);
    };
};

const arcTweenExit = d => {
    const i = d3.interpolate(d.startAngle, d.endAngle);

    return t => {
        d.startAngle = i(t);

        return arcPath(d);
    };
};

function arcTweenUpdate(d) {

    const i = d3.interpolate(this._current, d);

    this._current = i(1);

    return t => {
        return arcPath(i(t));
    };
}

const handleMouseOver = event => {
    //console.log(event.currentTarget);
    d3.select(event.currentTarget).transition('changeSliceFill').duration(300).attr('fill', '#fff');
};
const handleMouseOut = (event, d) => {
    //console.log(event.currentTarget);
    d3.select(event.currentTarget).transition('changeSliceFill').duration(300).attr('fill', colour(d.data.name));
};

const handleClick = (event, d) => {
    const id = d.data.id;

    db.collection('expenses').doc(id).delete();

};



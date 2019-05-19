console.log('Welcome to CSE 564!');
queue()
    .defer(d3.json, "/data")
    .await(constructGraphs);

function remove_NA_keys(source_group) {
    return {
        all:function() {
            return source_group.all().filter(function(d) {
                return d.key != "NA";
            });
        }
    };
}

var clear_charts = function() {
    dc.filterAll();
    dc.renderAll();
}

function constructGraphs(error, data) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }
    console.log('In constructGraphs!');



    // Create a Crossfilter instance
    var stack2018 = crossfilter(data);
    // console.log(stack2018.size());

    // Split the multi-valued attributes
    data.forEach(function (d) {
        d.LanguageWorkedWith    = d.LanguageWorkedWith.split(";");
        d.FrameworkWorkedWith   = d.FrameworkWorkedWith.split(";");
        d.DatabaseWorkedWith    = d.DatabaseWorkedWith.split(";");
        d.DevType               = d.DevType.split(";");
        d.IDE                   = d.IDE.split(";");
        d.VersionControl        = d.VersionControl.split(";");
    });
    console.log(data);

    /*
     * this grouping observes all current filters
     * selected by the user
     */
    var all = stack2018.groupAll();
    var numberSelectedND = dc.numberDisplay("#numberSelectedND");
    numberSelectedND
        .formatNumber(d3.format(",.0f"))
        .valueAccessor(function (d) {return d;})
        .group(all);

    // DEVELOPER TYPE menu select
    // https://github.com/crossfilter/crossfilter/wiki/API-Reference#dimension
    var devTypeDim = stack2018.dimension(function (d) {
        return d.DevType;
    }, true);

    var langByDevTypeGroup = devTypeDim.group();
    // console.log(langByDevTypeGroup);
    var langByDevTypeGroup_filtered = remove_NA_keys(langByDevTypeGroup);
    // console.log(langByDevTypeGroup_filtered);

    // filter out "NA" data keys from chart
    var developerTypeMenu = dc.selectMenu("#developerTypeMenu");
    developerTypeMenu
        .dimension(devTypeDim)
        .group(langByDevTypeGroup_filtered);

    /**
     * LANGUAGE BAR CHART - ordinal scale
     */
    var languageDim = stack2018.dimension(function (d) {
        return d.LanguageWorkedWith;
    }, true);
    var languageGroup = languageDim.group();
    // filter out 'NA' keys from data
    var languageGroup_filtered = remove_NA_keys(languageGroup);
    var languageChart = dc.barChart("#languageChart");

    // get width for initial render of the bar chart. The bar chart is responsive
    // and its width will adapt to screen width - see onresize event handler at bottom.
    var barChartWidth = $('#languageChartContainer').offsetWidth;

    languageChart
        .width(barChartWidth)
        .height(430)
        .margins({ top: 30, right: 50, bottom: 90, left: 50 })
        .dimension(languageDim)
        .group(languageGroup_filtered)
        .transitionDuration(1000)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .gap(3)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .title(function(d) {return "";})
        .yAxis().ticks(6);


    // IDE used menu select
    // https://github.com/crossfilter/crossfilter/wiki/API-Reference#dimension
    var ideDim = stack2018.dimension(function (d) {
        return d.IDE;
    }, true);

    var ideGroup = ideDim.group();
    var ideGroup_filtered = remove_NA_keys(ideGroup);
//    console.log(ideGroup_filtered);

    // filter out "NA" data keys from chart
    var ideMenu = dc.selectMenu("#ideMenu");
    ideMenu
        .dimension(ideDim)
        .group(ideGroup_filtered);

    var ideChart = dc.barChart("#ideChart");
    var ideBarChartWidth = $('#ideChartContainer').offsetWidth;

    ideChart
        .width(ideBarChartWidth)
        .height(350)
        .margins({ top: 30, right: 50, bottom: 80, left: 50 })
        .dimension(ideDim)
        .group(ideGroup_filtered)
        .transitionDuration(1000)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .gap(3)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .title(function(d) {return "";})
        .yAxis().ticks(6);


    // Gender distribution of responses
    var genderDim = stack2018.dimension(function (d) {
        return d.Gender;
    });
    var genderGroup = genderDim.group();
    var genderGroup_filtered = remove_NA_keys(genderGroup);
    var genderChart = dc.pieChart("#genderChart");

    genderChart
        .height(350)
        .innerRadius(50)
        .slicesCap(2)
        .drawPaths(true)
        .dimension(genderDim)
        .group(genderGroup_filtered)
        .transitionDuration(200)
        .title(function(d) {return "";})
        .legend(dc.legend().x(400))

    genderChart
        .on('pretransition', function(chart) {
          chart.selectAll('.dc-legend-item text')
              .text('')
            .append('tspan')
              .text(function(d) { return d.name; })
            .append('tspan')
              .attr('x', 100)
              .attr('text-anchor', 'end')
              .text(function(d) { return d.data; });
        });

    /**
     * DATABASES row chart
     */
    var databaseDim = stack2018.dimension(function (d) {
        return d.DatabaseWorkedWith;
    }, true);
    var languageByDatabaseGroup = databaseDim.group();
    // filter out "NA" data keys from chart
    var languageByDatabaseGroup_filtered = remove_NA_keys(languageByDatabaseGroup);
    var databaseChart = dc.rowChart("#databaseChart");

    var databaseChartWidth = $("#databaseChart").offsetWidth;

    databaseChart
        .width(databaseChartWidth)
        .height(400)
        .rowsCap(10)
        .dimension(databaseDim)
        .group(languageByDatabaseGroup_filtered)
        .transitionDuration(1000)
        .othersGrouper(false)
        .elasticX(true)
        .xAxis().ticks(4);


    /**
     * FRAMEWORKS row chart
     */
    var frameworkDim = stack2018.dimension(function (d) {
        return d.FrameworkWorkedWith;
    }, true)
    var languageByFrameworkGroup = frameworkDim.group();
    // filter out "NA" data keys from chart
    var languageByFrameworkGroup_filtered = remove_NA_keys(languageByFrameworkGroup);
    var frameworkChart = dc.rowChart("#frameworkChart");

    var frameworkChartWidth = $("#frameworkChart").offsetWidth;

    frameworkChart
        .width(frameworkChartWidth)
        .height(400)
        .rowsCap(10)
        .dimension(frameworkDim)
        .group(languageByFrameworkGroup_filtered)
        .transitionDuration(1000)
        .othersGrouper(false)
        .elasticX(true)
        .xAxis().ticks(4);

    dc.renderAll();



    /* TOOLTIPS */
    // initialize tooltips for languages bar chart tooltip
    var bar_tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            console.log(d.key);
            return "<strong>" + d.data.key + ":</strong> <span class='tooltip-value'>"
                   + d.data.value + "</span>";
        });

    d3.selectAll("#languageChart .bar")
        .call(bar_tooltip)
        .on('mouseover', bar_tooltip.show)
        .on('mouseout', bar_tooltip.hide);

    d3.selectAll("#ideChart .bar")
        .call(bar_tooltip)
        .on('mouseover', bar_tooltip.show)
        .on('mouseout', bar_tooltip.hide);

    // initialize tooptips for pie charts
    var pie_tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([20, 0])
        .html(function(d) {
            return "<strong>" +d.data.key + ":</strong> <span class='tooltip-value'>" + d.value;
        });

    d3.selectAll(".pie-slice")
        .call(pie_tooltip)
        .on('mouseover', pie_tooltip.show)
        .on('mouseout', pie_tooltip.hide);

}
console.log('Welcome to CSE 564!');
queue()
    .defer(d3.json, "/data")
    .await(constructDesiredGraphs);

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

function constructDesiredGraphs(error, data) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }
    console.log('In constructDesiredGraphs!');
    $("#loader").fadeOut();


    // Create a Crossfilter instance
    var stack2018 = crossfilter(data);
    // console.log(stack2018.size());

    // Split the multi-valued attributes
    data.forEach(function (d) {
        d.LanguageDesireNextYear    = d.LanguageDesireNextYear.split(";");
        d.FrameworkDesireNextYear   = d.FrameworkDesireNextYear.split(";");
        d.DatabaseDesireNextYear    = d.DatabaseDesireNextYear.split(";");
        d.DevType                   = d.DevType.split(";");
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
        return d.LanguageDesireNextYear;
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

    /**
     * DATABASES row chart
     */
    var databaseDim = stack2018.dimension(function (d) {
        return d.DatabaseDesireNextYear;
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
        return d.FrameworkDesireNextYear;
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
    var row_tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>" + d.key + ":</strong> <span class='tooltip-value'>" + d.value + "</span>";
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

    d3.selectAll("#databaseChart .row")
        .call(row_tooltip)
        .on('mouseover', row_tooltip.show)
        .on('mouseout', row_tooltip.hide);

    d3.selectAll("#frameworkChart .row")
        .call(row_tooltip)
        .on('mouseover', row_tooltip.show)
        .on('mouseout', row_tooltip.hide);

}
console.log('Welcome to CSE 564!');
queue()
    .defer(d3.json, "/data")
    .await(constructGraphs);

function constructGraphs(error, data) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }
    console.log('In constructGraphs!');

    // Create a Crossfilter instance
    var stack2018 = crossfilter(data);
    console.log(stack2018.size());

   /* *
    * Split the multi-valued attributes
    */

    data.forEach(function (d) {
        d.LanguageWorkedWith    = d.LanguageWorkedWith.split(";");
        d.FrameworkWorkedWith   = d.FrameworkWorkedWith.split(";");
        d.DatabaseWorkedWith    = d.DatabaseWorkedWith.split(";");
        d.DevType               = d.DevType.split(";");
        d.IDE                   = d.IDE.split(";");
        d.VersionControl        = d.VersionControl.split(";");
    });
    console.log(data);

    var all = stack2018.groupAll();
    var numberSelectedND = dc.numberDisplay("#numberSelectedND");
    numberSelectedND
        .formatNumber(d3.format(",.0f"))
        .valueAccessor(function (d) {return d;})
        .group(all);

    dc.renderAll();

}
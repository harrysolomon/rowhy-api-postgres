export const lineChart = (response) => {

    let schema = {
        "data": {
            "labels": [
            ],
            "datasets": [
                {
                "data": [],
                "backgroundColor": [
                    "rgba(55, 125, 255, .5)",
                    "rgba(255, 255, 255, .2)"
                  ],
                "borderColor": "#377dff",
                "borderWidth": 2,
                "pointRadius": 0,
                "hoverBorderColor": "#377dff",
                "pointBackgroundColor": "#377dff",
                "pointBorderColor": "#fff",
                "pointHoverRadius": 0
                },
                {
                "data": [],
                "backgroundColor": [
                    "rgba(0, 201, 219, .5)",
                    "rgba(255, 255, 255, .2)"
                  ],
                "borderColor": "#00c9db",
                "borderWidth": 2,
                "pointRadius": 0,
                "hoverBorderColor": "#00c9db",
                "pointBackgroundColor": "#00c9db",
                "pointBorderColor": "#fff",
                "pointHoverRadius": 0
                }
            ]
        },
        "options": {
            "gradientPosition": {
                "y1": 200
            },
            "legend": {
                "display": false
            },
            "scales": {
                "yAxes": [
                    {
                        "gridLines": {
                        "color": "#e7eaf3",
                        "drawBorder": false,
                        "zeroLineColor": "#e7eaf3"
                        },
                        "ticks": {
                        "suggestedMin": -20168,
                        "suggestedMax": 430091,
                        "fontColor": "#97a4af",
                        "fontFamily": "Open Sans, sans-serif",
                        "padding": 10,
                        "postfix": "k"
                        }
                    }
                ],
                "xAxes": [
                    {
                        "gridLines": {
                        "display": false,
                        "drawBorder": false
                        },
                        "ticks": {
                        "fontSize": 12,
                        "fontColor": "#97a4af",
                        "fontFamily": "Open Sans, sans-serif",
                        "padding": 5
                        }
                    }
                ]
            },
            "tooltips": {
                "prefix": "$",
                "hasIndicator": true,
                "mode": "index",
                "intersect": false,
                "lineMode": true,
                "lineWithLineColor": "rgba(19, 33, 68, 0.075)"
            },
            "hover": {
                "mode": "nearest",
                "intersect": true
            },
            "maintainAspectRatio":false,
        }
    }
// add another for loop to make the number of lines dynamic and pick off a list of colors to choose from

    for (let i = 0;i < response.length;++i) {
        schema.data.labels.push(response[i].time_increment)
        schema.data.datasets[0].data.push(response[i].new_cost_per_period)
        schema.data.datasets[1].data.push(response[i].current_cost_per_period)
    }
    let combined_cost = schema.data.datasets[0].data.concat(schema.data.datasets[1].data);

        let minimum_val = Math.min.apply(Math, combined_cost);
        let maximum_val = Math.max.apply(Math, combined_cost);

        schema.options.scales.yAxes[0].ticks.suggestedMin = minimum_val
        schema.options.scales.yAxes[0].ticks.suggestedMax = maximum_val

    return schema 
};
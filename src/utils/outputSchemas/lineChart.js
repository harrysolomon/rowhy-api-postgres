export const lineChart = (response) => {

    let schema = {
        "data": {
            "labels": [
            ],
            "datasets": [
                {
                "data": [],
                "backgroundColor": "transparent",
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
                "backgroundColor": "transparent",
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

    return schema 
};
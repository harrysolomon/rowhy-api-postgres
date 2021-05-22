//this is for the add on queries beyond the per task 

export const chartTypes = (query_params,url_params) => {
    let dimensions = query_params.dimensions.split(',');
    let chart_options = {
        trend: `,groupings as (
            select 
            ${dimensions[0]},
            ${dimensions[1]},
            period_label,
            sum(current_cost_per_period) as current_cost_per_period,
            sum(new_cost_per_period) as new_cost_per_period,
            sum(current_cost_per_period - new_cost_per_period) as value_per_period
            from task_costs
            where ${query_params.filter_dimension} in (${query_params.filter_value})
            group by 1,2,3
        )
            select 
            g.${dimensions[0]}, 
            g.${dimensions[1]},
            concat(g.period_label || ts.periods) as time_increment,
            sum(g.current_cost_per_period) OVER (ORDER BY ts.periods) as current_cost_per_period, 
            sum(g.new_cost_per_period) OVER (ORDER BY ts.periods) as new_cost_per_period,
            sum(g.value_per_period) OVER (ORDER BY ts.periods) as value_per_period
            from groupings g
            join time_series ts
            on g.${query_params.filter_dimension} = ts.${query_params.filter_dimension}
            order by time_increment`,
        summary: `
            select *
            from task_costs
            where ${query_params.filter_dimension} in (${query_params.filter_value})`,
        table: `,groupings as (
            select 
            ${dimensions[0]},
            ${dimensions[1]},
            period_label,
            sum(current_cost_per_period) as current_cost_per_period,
            sum(new_cost_per_period) as new_cost_per_period,
            sum(current_cost_per_period - new_cost_per_period) as value_per_period
            from task_costs
            where ${query_params.filter_dimension} in (${query_params.filter_value})
            group by 1,2,3
        )
            select 
            g.${dimensions[0]}, 
            g.${dimensions[1]},
            concat(g.period_label || ts.periods) as time_increment,
            sum(g.current_cost_per_period) OVER (ORDER BY ts.periods) as current_cost_per_period, 
            sum(g.new_cost_per_period) OVER (ORDER BY ts.periods) as new_cost_per_period,
            sum(g.value_per_period) OVER (ORDER BY ts.periods) as value_per_period
            from groupings g
            join time_series ts
            on g.${query_params.filter_dimension} = ts.${query_params.filter_dimension}
            order by time_increment`
    }

    return chart_options[url_params.chartType]
}
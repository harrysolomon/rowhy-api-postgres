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
            to_char(sum(g.current_cost_per_period) OVER (ORDER BY ts.periods), 'FM999999999') as current_cost_per_period, 
            to_char(sum(g.new_cost_per_period) OVER (ORDER BY ts.periods), 'FM999999999') as new_cost_per_period,
            to_char(sum(g.value_per_period) OVER (ORDER BY ts.periods), 'FM999999999') as value_per_period
            from groupings g
            join time_series ts
            on g.${query_params.filter_dimension} = ts.${query_params.filter_dimension}
            order by ts.periods`,
        summary: `
            select *
            from task_costs
            where ${query_params.filter_dimension} in (${query_params.filter_value})
            limit 1`,
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
            order by ts.periods`,
        totals: `
            select 
            calculator_id,
            calculator_name,
            employee_id,
            employee_name,
            employee_info,
            time_saver_product_id,
            product_name,
            product_info,
            task_id,
            task_name,
            task_info,
            sum(new_time_spent_per_period * ${query_params.forecast_period}) over (partition by calculator_id) as total_new_time_spent,
            sum(new_time_spent_per_period * ${query_params.forecast_period}) over (partition by employee_id) as total_new_time_spent_per_employee,
            sum(new_time_spent_per_period * ${query_params.forecast_period}) over (partition by time_saver_product_id) as total_new_time_spent_per_product,
            sum(new_time_spent_per_period * ${query_params.forecast_period}) over (partition by task_id) as total_task_new_time_spent,
            to_char((1- (sum(new_time_spent_per_period * ${query_params.forecast_period}) over (partition by calculator_id) / sum(current_time_spent_per_period * ${query_params.forecast_period}) over (partition by calculator_id))) * 100, 'FM999999999.00') as total_time_spent_pct_change,
            to_char((1- (sum(new_time_spent_per_period * ${query_params.forecast_period}) over (partition by employee_id) / sum(current_time_spent_per_period * ${query_params.forecast_period}) over (partition by employee_id))) * 100, 'FM999999999.00') as total_time_spent_pct_change_per_employee,
            to_char((1- (sum(new_time_spent_per_period * ${query_params.forecast_period}) over (partition by time_saver_product_id) / sum(current_time_spent_per_period * ${query_params.forecast_period}) over (partition by time_saver_product_id))) * 100, 'FM999999999.00') as total_time_spent_pct_change_per_product,
            to_char((1- (sum(new_time_spent_per_period * ${query_params.forecast_period}) over (partition by task_id) / sum(current_time_spent_per_period * ${query_params.forecast_period}) over (partition by task_id))) * 100, 'FM999999999.00') as total_task_time_spent_pct_change,
            sum(product_cost_per_period * ${query_params.forecast_period}) over (partition by task_id) as total_product_cost_per_task,
            sum(current_cost_per_period * ${query_params.forecast_period}) over (partition by calculator_id) as total_current_cost,
            sum(current_cost_per_period * ${query_params.forecast_period}) over (partition by employee_id) as total_current_cost_per_employee,
            sum(current_cost_per_period * ${query_params.forecast_period}) over (partition by time_saver_product_id) as total_current_cost_per_product,
            sum(current_cost_per_period * ${query_params.forecast_period}) over (partition by task_id) as total_task_current_cost,
            sum(new_cost_per_period  * ${query_params.forecast_period}) over (partition by calculator_id) as total_new_cost,
            sum(new_cost_per_period * ${query_params.forecast_period}) over (partition by employee_id) as total_new_cost_per_employee,
            sum(new_cost_per_period * ${query_params.forecast_period}) over (partition by time_saver_product_id) as total_new_cost_per_product,
            sum(new_cost_per_period * ${query_params.forecast_period}) over (partition by task_id) as total_new_cost_per_task,
            to_char(sum((current_cost_per_period - new_cost_per_period) * ${query_params.forecast_period}) over (partition by calculator_id), 'FM999999999.00') as total_value,
            to_char(sum((current_cost_per_period - new_cost_per_period) * ${query_params.forecast_period}) over (partition by employee_id), 'FM999999999.00') as total_value_per_employee,
            to_char(sum((current_cost_per_period - new_cost_per_period) * ${query_params.forecast_period}) over (partition by time_saver_product_id), 'FM999999999.00') as total_value_per_product,
            to_char(sum((current_cost_per_period - new_cost_per_period) * ${query_params.forecast_period}) over (partition by task_id), 'FM999999999.00') as total_value_per_task,
            to_char((sum((current_cost_per_period - new_cost_per_period) * ${query_params.forecast_period}) over (partition by task_id) / sum(product_cost_per_period * ${query_params.forecast_period}) over (partition by task_id)) * 100, 'FM999999999.00') as roi_pct_per_task,
            to_char((sum((current_cost_per_period - new_cost_per_period) * ${query_params.forecast_period}) over (partition by calculator_id) / sum(product_cost_per_period * ${query_params.forecast_period}) over (partition by calculator_id)) * 100, 'FM999999999.00') as roi_pct
            from task_costs
            where ${query_params.filter_dimension} in (${query_params.filter_value})`
    }

    return chart_options[url_params.chartType]
}
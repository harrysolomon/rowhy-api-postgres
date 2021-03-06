export const costPerTask = (query_params,url_params) => {
    let per_task = 
        ` with time_savings as (
            select 
            c.id as calculator_id,
            c.name as calculator_name,
            tst.id as task_id,
            tst.name as task_name,
            ${query_params.cadence_key} as analysis_period,
            cadence,
            case when tst.current_time_spent = 1 then ck_time_spent.singular else ck_time_spent.plural end as task_time_spent_period,
            concat(tst.current_time_spent || ' ' || case when tst.current_time_spent = 1 then ck_time_spent.singular else ck_time_spent.plural end || ' per ' || ck_time_period.singular) as task_info,
            current_time_spent,
            (tsp.time_save * cr.ratio) as time_save_convert,
            (tst.current_time_spent - (tsp.time_save * cr.ratio)) as new_time_spent,
            ((tsp.time_save * cr.ratio)/tst.current_time_spent) as time_save_ratio
            from time_saver_task tst
            join time_saver_product tsp
            on tst.time_saver_product_id = tsp.id
            join product p 
            on tsp.product_id = p.id
            join cadence_ratio cr 
            on cr.base_cadence = tsp.time_unit
            join cadence_key ck_time_spent 
            on ck_time_spent.id = tst.current_time_spent_period
            join cadence_key ck_time_period
            on ck_time_period.id = tst.cadence
            join calculator c 
            on c.id = tst.calculator_id
            where cr.comparison_cadence = tst.current_time_spent_period
            and tst.calculator_id = ${url_params.calculatorId}
            and tst.deleted_at is null),
            
            employee_cost as (
            select 
            tst.id as task_id, 
            w.id as employee_id,
            w.name as employee_name,
            w.cost as employee_cost,
            ck.singular as task_period, 
            concat('$' || w.cost || '/' || ck_employee_cost.singular) as employee_info,
            (w.cost * cr.ratio) as employee_rate,
            (w.cost * cr.ratio * tst.current_time_spent) as employee_cost_task
            from time_saver_task tst
            join workers w 
            on tst.time_saver_worker_id = w.id
            join cadence_ratio cr
            on cr.base_cadence = tst.current_time_spent_period
            join cadence_key ck 
            on ck.id = tst.current_time_spent_period
            join cadence_key ck_employee_cost
            on ck_employee_cost.id = w.period
            where tst.calculator_id = ${url_params.calculatorId}
            and cr.comparison_cadence = w.period),
            
            product as (
            select 
            tst.id as task_id,
            tst.name as task_name,
            tsp.id as time_saver_product_id,
            p.name as product_name, 
            tsp.cost as product_cost, 
            (tsp.cost * cr.ratio) as product_cost_per_task,
            concat(tsp.time_save || ' ' || case when time_save = 1 then ck_product_time.singular else ck_product_time.plural end || ' per Task | $' || tsp.cost || '/' || ck_product_cost.singular) as product_info
            from time_saver_task tst
            join time_saver_product tsp
            on tst.time_saver_product_id = tsp.id
            join cadence_ratio cr
            on cr.base_cadence = tst.cadence
            join product p 
            on p.id = tsp.product_id
            join cadence_key ck_product_time
            on ck_product_time.id = tsp.time_unit
            join cadence_key ck_product_cost 
            on ck_product_cost.id = tsp.period
            where tst.calculator_id = ${url_params.calculatorId}
            and cr.comparison_cadence = tsp.period),
        time_series as (
        SELECT ${query_params.filter_value} as ${query_params.filter_dimension}, generate_series as periods FROM GENERATE_SERIES(1, ${query_params.forecast_period})
        ),
        task_costs as (  
            select
        ts.calculator_id,
        ts.calculator_name, 
            ts.task_id,
            ts.task_name,
            ts.task_info,
            p.time_saver_product_id,
            p.product_info,
            p.product_name,
            ec.employee_id,
            ec.employee_name,
            ec.employee_info,
            (ts.current_time_spent * cr.ratio) as current_time_spent_per_period,
            (ts.new_time_spent * cr.ratio) as new_time_spent_per_period,
            ts.task_time_spent_period, 
            ts.cadence as task_cadence,
            ts.time_save_ratio,
            (1 - ts.time_save_ratio) as new_time_save_pct,
            p.product_cost_per_task,
            (p.product_cost_per_task * cr.ratio) as product_cost_per_period,
            ec.task_period,
            ck.singular as analysis_period,
            ck.label as period_label,
            cr.ratio as num_tasks_in_period,
            ec.employee_rate as employee_rate,
            (ec.employee_rate * ts.current_time_spent) as current_cost_per_task,
            (ec.employee_rate * ts.current_time_spent * cr.ratio) as current_cost_per_period,
            ((ec.employee_rate * ts.new_time_spent) + p.product_cost_per_task) as new_cost_per_task,
            ((ec.employee_rate * ts.new_time_spent * cr.ratio) + (p.product_cost_per_task * cr.ratio)) as new_cost_per_period,
            ((ec.employee_rate * ts.current_time_spent ) - ((ec.employee_rate * ts.new_time_spent) + p.product_cost_per_task)) as value_per_task,
            ((ec.employee_rate * ts.current_time_spent * cr.ratio) - ((ec.employee_rate * ts.new_time_spent * cr.ratio) + (p.product_cost_per_task * cr.ratio))) as value_per_period
            from time_savings ts 
            join employee_cost ec
            on ts.task_id = ec.task_id
            join cadence_ratio cr 
            on cr.base_cadence = ts.analysis_period
            join cadence_key ck
            on ck.id = ts.analysis_period
            join product p 
            on p.task_id = ts.task_id
            where cr.comparison_cadence = ts.cadence)`
    
    return per_task
}
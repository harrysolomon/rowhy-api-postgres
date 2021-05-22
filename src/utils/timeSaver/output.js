import { chartTypes } from './chartTypes'
import { costPerTask } from './costPerTask'
//this is the subquery in which all time saver sub queries should use

//things to change in the query: analysis period, number of calculators, dimension, dimension_filter where all means no filter

export const timeSaverOutput = (query_params,url_params) => {
  let chart_type = chartTypes(query_params,url_params)
  let cost_per_task = costPerTask(query_params,url_params)
  let output = `${cost_per_task} ${chart_type}`
    
  return output 
};
import { pool } from '../../../models/pool';

export const productList = async (req, res) => {
    try {
      const client_id = req.params.clientId;
      const calculator_type_id = req.params.calculatorTypeId
      const query = `
      select 
      tsp.id,
      p.id as product_id, 
      p.name, 
      p.description, 
      tsp.period, 
      tsp.cost, 
      tsp.time_save, 
      tsp.time_unit, 
      tsp.deleted_at, 
      tsp.created_at, 
      tsp.updated_at, 
      tsp.created_by, u.first_name || ' ' || u.last_name AS username,
      concat(time_save || ' ' || case when time_unit = 1 then ck1.singular else ck1.plural end) as time_savings,
      concat('$' || cost || '/' || ck2.singular) as cost_detail
      from time_saver_product tsp
      join product p
      on tsp.product_id = p.id
      join product_type pt 
      on p.product_type_id = pt.id
      join users u 
      on tsp.created_by = u.id
      join cadence_key ck1
      on tsp.time_unit = ck1.id
      join cadence_key ck2
      on tsp.period = ck2.id
      where pt.client_id = ${client_id}
      and tsp.calculator_type_id = ${calculator_type_id}
      and tsp.deleted_at is null
      and p.deleted_at is null
      and pt.deleted_at is null
      order by tsp.created_at desc
      `;
      const data = await pool.query(query);
      res.status(200).json( data.rows );
    } catch (err) {
      res.status(200).json({ messages: err.stack });
    }
  };

export const addProduct = async (req, res) => {
  try {
      await pool.query('BEGIN')
      
      const { name, description, product_type_id, created_by, calculator_type_id, period, cost, time_save, time_unit } = req.body;
      const columns = 'name, description, created_at';
      const product_values = `'${name}', '${description}', ${product_type_id}, ${created_by}`;

      const product = `
      insert into product(name,description,product_type_id,created_by,created_at,updated_at)
      values (${product_values},now(),now())
          RETURNING id, ${columns}
      `;
      const product_output = await pool.query(product);

      const time_saver_product_values = `'${calculator_type_id}', ${period}, ${cost}, ${time_save}, ${time_unit}, ${created_by}`;
      const time_saver_product = `
      insert into time_saver_product(product_id,calculator_type_id,period,cost,time_save,time_unit,created_by,created_at,updated_at)
      values 
      ($1,${time_saver_product_values},now(),now())
      returning id`
      const returned_product_details = [product_output.rows[0].id]
      const time_saver_product_output = await pool.query(time_saver_product,returned_product_details)


      res.status(200).json( time_saver_product_output.rows );
      await pool.query('COMMIT')
      
  } catch (err) {
      res.status(500).json({ messages: err.stack });
      await pool.query('ROLLBACK')
  } 
};

export const editProduct = async (req, res) => {
  try {
      await pool.query('BEGIN')
      
      const { name, description, product_type_id, calculator_type_id, period, cost, time_save, time_unit } = req.body;
      
      const product = `
      update product
      set 
        name = '${name}',
        description = '${description}',
        product_type_id = ${product_type_id},
        updated_at =  now()
      where id = ${req.params.productId}
      returning id as product_id, name
      `
      console.log("the product query is", product)
      const update_product = await pool.query(product);


      const time_saver_product = `
      update time_saver_product
      set 
        calculator_type_id = ${calculator_type_id},
        period = ${period},
        cost = ${cost},
        time_save = ${time_save},
        time_unit = ${time_unit},
        updated_at = now(),
        product_id = ${req.params.productId}
      where id = ${req.params.timeSaverProductId}
      returning id, product_id, period, cost, time_save, time_unit
      `
      console.log("the time saver product query is ", time_saver_product)

      const time_saver_product_output = await pool.query(time_saver_product)

      res.status(200).json({
        time_saver: time_saver_product_output.rows[0],
        product: update_product.rows[0]
      });
      await pool.query('COMMIT')
      
  } catch (err) {
      res.status(500).json({ messages: err.stack });
      await pool.query('ROLLBACK')
  } 
};

export const getTimeSaverProduct = async (req, res) => {
  try {
    const client_id = req.params.clientId;
    const calculator_type_id = req.params.calculatorTypeId
    const time_saver_product_id = req.params.timeSaverProductId
    const query = `
    select 
    tsp.id,
    p.id as product_id, 
    p.name, 
    p.description, 
    tsp.period, 
    tsp.cost, 
    tsp.time_save, 
    tsp.time_unit, 
    tsp.deleted_at, 
    tsp.created_at, 
    tsp.updated_at, 
    tsp.created_by, u.first_name || ' ' || u.last_name AS username,
    concat(time_save || ' ' || case when time_unit = 1 then ck1.singular else ck1.plural end) as time_savings,
    concat('$' || cost || '/' || ck2.singular) as cost_detail
    from time_saver_product tsp
    join product p
    on tsp.product_id = p.id
    join product_type pt 
    on p.product_type_id = pt.id
    join users u 
    on tsp.created_by = u.id
    join cadence_key ck1
    on tsp.time_unit = ck1.id
    join cadence_key ck2
    on tsp.period = ck2.id
    where pt.client_id = ${client_id}
    and tsp.calculator_type_id = ${calculator_type_id}
    and tsp.id = ${time_saver_product_id}
    and tsp.deleted_at is null
    and p.deleted_at is null
    and pt.deleted_at is null
    order by tsp.created_at desc
    `;
    const data = await pool.query(query);
    res.status(200).json( data.rows[0] );
  } catch (err) {
    res.status(200).json({ messages: err.stack });
  }
};
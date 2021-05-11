import express from 'express';
import { indexPage, messagesPage, addMessage, productList, cadenceKey, workerList, calculatorList, addProduct, addWorker} from '../controllers';

const indexRouter = express.Router();

indexRouter.get('/', indexPage);
indexRouter.get('/messages', messagesPage)
indexRouter.post('/messages', addMessage);
indexRouter.get('/:clientId/:calculatorTypeId/product/list', productList);
indexRouter.post('/:clientId/:calculatorTypeId/product/create', addProduct);
indexRouter.get('/:clientId/:calculatorTypeId/worker/list', workerList);
indexRouter.post('/:clientId/:calculatorTypeId/worker/create', addWorker);
indexRouter.get('/:clientId/:calculatorTypeId/calculator/list', calculatorList);
indexRouter.get('/cadence', cadenceKey);



export default indexRouter;

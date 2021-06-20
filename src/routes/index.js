import express from 'express';
import { 
    indexPage, 
    messagesPage, 
    addMessage, 
    productList, 
    cadenceKey, 
    workerList, 
    calculatorList, 
    addProduct,
    editProduct,
    getTimeSaverProduct, 
    addWorker, 
    calculatorInputs,
    calculatorData,
    addTimeSaverCalculator,
    editTimeSaverCalculator
} from '../controllers';

const indexRouter = express.Router();

indexRouter.get('/', indexPage);
indexRouter.get('/messages', messagesPage)
indexRouter.post('/messages', addMessage);
indexRouter.get('/:clientId/:calculatorTypeId/product/list', productList);
indexRouter.post('/:clientId/:calculatorTypeId/product/create', addProduct);
indexRouter.put('/:clientId/:calculatorTypeId/product/:productId/:timeSaverProductId/edit', editProduct);
indexRouter.get('/:clientId/:calculatorTypeId/product/:timeSaverProductId', getTimeSaverProduct);
indexRouter.get('/:clientId/:calculatorTypeId/worker/list', workerList);
indexRouter.post('/:clientId/:calculatorTypeId/worker/create', addWorker);
indexRouter.get('/:clientId/:calculatorTypeId/calculator/list', calculatorList);
indexRouter.get('/:clientId/:calculatorTypeId/calculator/:calculatorId/inputs', calculatorInputs);
indexRouter.get('/:clientId/:calculatorTypeId/calculator/:calculatorId/:chartType', calculatorData);
indexRouter.put('/:clientId/:calculatorTypeId/calculator/:calculatorId/edit', editTimeSaverCalculator);
indexRouter.post('/:clientId/:calculatorTypeId/calculator/create', addTimeSaverCalculator);
indexRouter.get('/cadence', cadenceKey);



export default indexRouter;

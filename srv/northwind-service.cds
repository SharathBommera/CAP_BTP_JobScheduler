using { northwind as db } from '../db/schema';

service NorthwindService {
    entity ImportedProducts as projection on db.ImportedProducts;

    @requires: 'JOBSCHEDULER'
    action importNextProduct() returns many ImportedProducts;
}
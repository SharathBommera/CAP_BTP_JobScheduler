namespace northwind;

entity ImportedProducts {
    key productID     : Integer;
        productName   : String(40);
        supplierID    : Integer;
        categoryID    : Integer;
        quantityPerUnit : String(20);
        unitPrice     : Decimal(10, 2);
        unitsInStock  : Integer;
        unitsOnOrder  : Integer;
        reorderLevel  : Integer;
        discontinued  : Boolean;
        importedAt    : Timestamp;
}

entity Products {
  key ID    : UUID;
  title     : String;
  price     : Decimal;
}

view ProductAnalytics as select from Products {
  ID,
  title,
  price * 1.1 as priceWithTax : Decimal
};

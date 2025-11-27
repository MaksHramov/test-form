import { useState } from 'react';
import styles from './Form.module.css';
import axios from 'axios';

interface Contragent { id: number; name: string; phone?: string; }
interface Warehouse { id: number; name: string; }
interface Paybox { id: number; name: string; }
interface Organization { id: number; name: string; }
interface PriceType { id: number; name: string; }
interface Product { id: number; name: string; price?: number; }

function Form() {
  const [token, setToken] = useState('');
  const [selectedContragent, setSelectedContragent] = useState<Contragent | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [contragents, setContragents] = useState<Contragent[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [payboxes, setPayboxes] = useState<Paybox[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [searchPhone, setSearchPhone] = useState('');
  const [searchProduct, setSearchProduct] = useState('');

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Введите токен');
  
    try {
      const tokenParam = `?token=${token}`;
  
      const [contragentsRes, warehousesRes, payboxesRes, organizationsRes, priceTypesRes, productsRes] = await Promise.all([
        axios.get(`https://app.tablecrm.com/api/v1/contragents/${tokenParam}`),
        axios.get(`https://app.tablecrm.com/api/v1/warehouses/${tokenParam}`),
        axios.get(`https://app.tablecrm.com/api/v1/payboxes/${tokenParam}`),
        axios.get(`https://app.tablecrm.com/api/v1/organizations/${tokenParam}`),
        axios.get(`https://app.tablecrm.com/api/v1/price_types/${tokenParam}`),
        axios.get(`https://app.tablecrm.com/api/v1/nomenclature/${tokenParam}`),
      ]);
  
      setContragents(contragentsRes.data.result || []);
      setWarehouses(warehousesRes.data.result || []);
      setPayboxes(payboxesRes.data.result || []);
      setOrganizations(organizationsRes.data.result || []);
      setPriceTypes(priceTypesRes.data.result || []);
      setProducts(productsRes.data.result || []);
  
      alert('Данные успешно загружены!');
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      alert('Ошибка при получении данных. Проверьте токен.');
    }
  };

  const handleContragentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setSearchPhone(phone);
    
    const contragent = contragents.find(c => c.phone === phone);
    if (contragent) {
      setSelectedContragent(contragent);
    } else {
      setSelectedContragent(null);
    }
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const productName = e.target.value;
    setSearchProduct(productName);
    
    const product = products.find(p => p.name === productName);
    if (product && !selectedProducts.find(sp => sp.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
      setSearchProduct('');
    }
  };

  const handleProductKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const product = products.find(p => 
        p.name.toLowerCase().includes(searchProduct.toLowerCase())
      );
      if (product && !selectedProducts.find(sp => sp.id === product.id)) {
        setSelectedProducts([...selectedProducts, product]);
        setSearchProduct('');
      }
    }
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const totalAmount = selectedProducts.reduce((sum, product) => sum + (product.price || 0), 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className={styles["form-container"]}>
      <form className={styles.form} onSubmit={handleTokenSubmit}>
        <label htmlFor="input-token">Токен</label>
        <input
          id="input-token"
          className={styles.input}
          type="text"
          placeholder="Введите токен"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className={styles.button} type="submit">Продолжить</button>

        <label htmlFor="input-tel">Контрагент (поиск по телефону)</label>
        <input
          list="contragents-list"
          id="input-tel"
          className={styles.input}
          type="tel"
          placeholder="+79239239233"
          value={searchPhone}
          onChange={handleContragentSelect}
        />
        <datalist id="contragents-list">
          {contragents
            .filter(c => c.phone?.includes(searchPhone))
            .map(c => (
              <option key={c.id} value={c.phone || ''}>{c.name}</option>
            ))}
        </datalist>

        {selectedContragent && (
          <div className={styles["selected-contragent"]}>
            Выбран контрагент: {selectedContragent.name}
          </div>
        )}

        <label htmlFor="select-check">Счёт поступления</label>
        <select className={styles.select} name="select-check" id="select-check">
          <option value="" disabled hidden>Выберите...</option>
          {payboxes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <label htmlFor="select-warehouse">Склад отгрузки</label>
        <select className={styles.select} name="select-warehouse" id="select-warehouse">
          <option value="" disabled hidden>Выберите...</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>

        <label htmlFor="select-organization">Организация</label>
        <select className={styles.select} name="select-organization" id="select-organization">
          <option value="" disabled hidden>Выберите...</option>
          {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>

        <label htmlFor="select-type_price">Тип цены</label>
        <select className={styles.select} name="select-type_price" id="select-type_price">
          <option value="" disabled hidden>Выберите...</option>
          {priceTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
        </select>

        <label htmlFor="input-search">Поиск товара</label>
        <input
          list="products-list"
          id="input-search"
          className={styles.input}
          type="text"
          placeholder="Введите название товара"
          value={searchProduct}
          onChange={handleProductSelect}
          onKeyPress={handleProductKeyPress}
        />
        <datalist id="products-list">
          {filteredProducts.map(p => (
            <option key={p.id} value={p.name}>
              {p.name} - {(p.price || 0)} ₽
            </option>
          ))}
        </datalist>

        <div className={styles["products-container"]}>
          {selectedProducts.map(product => (
            <div key={product.id} className={styles["product-item"]}>
              <div className={styles["product-name"]}>{product.name}</div>
              <div className={styles["product-price"]}>{(product.price || 0)} ₽</div>
              <button 
                type="button" 
                className={styles["remove-button"]}
                onClick={() => removeProduct(product.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className={styles["information-container"]}>
          {selectedContragent && (
            <div className={styles["contragent-info"]}>
              Контрагент: {selectedContragent.name}
            </div>
          )}
          <div className={styles["totals"]}>
            <div className={styles["totals-elem"]}>
              <p>Итого товаров:</p>
              <p>{selectedProducts.length}</p>
            </div>
            <div className={styles["totals-elem"]}>
              <p>Сумма:</p>
              <p>{totalAmount} ₽</p>
            </div>
          </div>
        </div>

        <button type="button" className={styles.button}>Создать продажу</button>
        <button type="button" className={styles.button}>Создать и провести</button>
      </form>
    </div>
  );
}

export default Form;
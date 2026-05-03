import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getProducts } from '../../api/products';
import ProductCard from '../../components/ProductCard/ProductCard';
import s from './HomePage.module.css';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories);
    getProducts({ per_page: 6, sort: 'name' }).then((d) => setPopular(d.items));
  }, []);

  return (
    <div>
      <div className={s.banner}>
        <h1 className={s.bannerTitle}>Завод лампочек — свет для вашего дома</h1>
        <p className={s.bannerSub}>Широкий выбор ламп с доставкой по всей России</p>
      </div>

      <div className={s.page}>
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Категории</h2>
          <div className={s.categories}>
            {categories.map((c) => (
              <Link key={c.slug} to={`/catalog?category=${c.slug}`} className={s.catCard}>
                {c.name}
              </Link>
            ))}
          </div>
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Популярные товары</h2>
          <div className={s.grid}>
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <Link to="/catalog" className={s.allLink}>Смотреть весь каталог →</Link>
        </section>
      </div>
    </div>
  );
}

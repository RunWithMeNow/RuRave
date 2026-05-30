import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout/PageLayout.jsx';

const AboutPage = () => {
    return (
        <PageLayout title="О RuRave">
            <p className="page__text">
                RuRave — сервис-афиша рейв-концертов в городах России. Выбирайте город,
                смотрите актуальные события и находите выступления любимых артистов.
            </p>
            <p className="page__text">
                В текущей версии MVP доступны: афиша с карточками концертов, фильтр по
                городу, поиск по исполнителю, страница мероприятия с описанием и категориями
                билетов. Оплата и личный кабинет появятся в следующих итерациях.
            </p>
            <p className="page__hint">
                Проект разрабатывается в рамках учебной дисциплины «Управление IT-проектами».
            </p>
            <Link to="/" className="page__link">
                На афишу
            </Link>
        </PageLayout>
    );
};

export default AboutPage;

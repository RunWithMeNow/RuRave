import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout/PageLayout.jsx';

const ProfilePage = () => {
    return (
        <PageLayout title="Профиль">
            <p className="page__text">
                Войдите, чтобы сохранять избранные концерты и быстро возвращаться к ним.
            </p>
            <p className="page__hint">
                Авторизация пока в разработке — скоро здесь появится вход в аккаунт.
            </p>
            <Link to="/" className="page__link">
                На главную
            </Link>
        </PageLayout>
    );
};

export default ProfilePage;

import './PageLayout.css';
import '../../App.css';

const PageLayout = ({ title, children }) => {
    return (
        <div className="page">
            <div className="layout-container page__inner">
                <article className="page__card">
                    <h1 className="page__title">{title}</h1>
                    <div className="page__content">{children}</div>
                </article>
            </div>
        </div>
    );
};

export default PageLayout;

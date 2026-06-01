import {
    ABOUT_DISCIPLINE,
    ABOUT_INTRO,
    ABOUT_MVP_FOOTNOTE,
    ABOUT_MVP_ITEMS,
} from '../../content/siteCopy.js';
import './AboutSection.css';

const AboutSection = () => {
    return (
        <section
            id="about"
            className="home-about section-spacing"
            aria-labelledby="home-about-heading"
        >
            <div className="home-about__inner layout-container">
                <div className="home-about__card">
                    <h2 id="home-about-heading" className="home-about__title">
                        О RuRave
                    </h2>
                    <div className="home-about__content">
                        <p className="home-about__text">{ABOUT_INTRO}</p>
                        <p className="home-about__text">
                            <strong>Что уже работает в этой версии:</strong>
                        </p>
                        <ul className="home-about__list">
                            {ABOUT_MVP_ITEMS.map((item) => (
                                <li key={item} className="home-about__list-item">
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <p className="home-about__text">{ABOUT_MVP_FOOTNOTE}</p>
                        <p className="home-about__hint">{ABOUT_DISCIPLINE}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;

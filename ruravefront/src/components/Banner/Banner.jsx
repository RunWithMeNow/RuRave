import './Banner.css';
import '../../App.css';

const Banner = (props) => {
    return(
        <div className="banner-container">
            <img src={props.imageUrl} 
                alt={props.alt || "Banner image"} 
                className="banner-image"/>
        </div>
    );
};
export default Banner;
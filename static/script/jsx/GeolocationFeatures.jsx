/**
 * Created by William on 16/11/16.
 */
var Scatter = React.createClass({
    render:function(){
        return (
            <div>
                <h3>Geolocation Features from Twitter</h3>
                <div className="pad bottom-left-svg">
                    <DonutChart id="bs_chart" padAngle={0.03}/>
                </div>
            </div>
        )
    }
});
ReactDOM.render(<Scatter/>,document.getElementById("#geolocation svg"));


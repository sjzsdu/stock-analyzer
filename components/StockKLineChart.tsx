'use client';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';
import 'highcharts/modules/stock';
import { useEffect } from 'react';

highchartsMore(Highcharts);

interface Props {
  data: number[][];
  symbol: string;
}

export default function StockKLineChart({ data, symbol }: Props) {
  useEffect(() => {
    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    });
  }, []);

  const options = {
    chart: {
      height: 400,
      backgroundColor: '#ffffff'
    },
    rangeSelector: {
      selected: 1,
      buttons: [{
        type: 'month',
        count: 1,
        text: '1月'
      }, {
        type: 'month',
        count: 3,
        text: '3月'
      }, {
        type: 'month',
        count: 6,
        text: '6月'
      }, {
        type: 'year',
        count: 1,
        text: '1年'
      }, {
        type: 'all',
        text: '全部'
      }]
    },
    title: {
      text: `${symbol} K线图`
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: [{
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: '股价'
      },
      height: '70%',
      resize: {
        enabled: true
      }
    }, {
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: '成交量'
      },
      top: '75%',
      height: '25%',
      offset: 0
    }],
    tooltip: {
      split: false,
      shared: true,
      valueDecimals: 2
    },
    series: [{
      type: 'candlestick',
      name: '股价',
      data: data,
      tooltip: {
        valueDecimals: 2
      },
      upColor: '#089981',
      upLineColor: '#089981',
      downColor: '#e13443',
      downLineColor: '#e13443'
    }, {
      type: 'column',
      name: '成交量',
      data: data.map(d => [d[0], d[5]]),
      yAxis: 1,
      color: '#7cb5ec'
    }]
  };

  return (
    <div className="w-full">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        constructorType={'stockChart'}
      />
    </div>
  );
}

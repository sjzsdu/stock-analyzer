'use client';
import { useEffect } from 'react';

// 动态导入 Highcharts 以避免 SSR 问题
let Highcharts: any = null;
let HighchartsReact: any = null;

if (typeof window !== 'undefined') {
  Highcharts = require('highcharts/highstock');
  HighchartsReact = require('highcharts-react-official').default;
  const highchartsMore = require('highcharts/highcharts-more');
  require('highcharts/modules/stock');

  highchartsMore(Highcharts);
}

interface Props {
  data: number[][];
  symbol: string;
}

export default function StockKLineChart({ data, symbol }: Props) {
  useEffect(() => {
    Highcharts.setOptions({
      lang: {
        thousandsSep: ',',
        rangeSelectorFrom: '从',
        rangeSelectorTo: '到',
        rangeSelectorZoom: '缩放',
        downloadPNG: '下载 PNG 图片',
        downloadJPEG: '下载 JPEG 图片',
        downloadPDF: '下载 PDF 文档',
        downloadSVG: '下载 SVG 矢量图',
        printChart: '打印图表',
        resetZoom: '重置缩放',
        resetZoomTitle: '重置为原始大小',
        months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        shortMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
      chart: {
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }
      }
    });
  }, []);

  const options = {
    chart: {
      height: 450,
      backgroundColor: 'transparent',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      marginTop: 10,
      animation: {
        duration: 1000
      }
    },
    rangeSelector: {
      selected: 1,
      buttons: [{
        type: 'month',
        count: 1,
        text: '1月',
        className: 'px-3 py-1 rounded-lg text-sm font-medium'
      }, {
        type: 'month',
        count: 3,
        text: '3月',
        className: 'px-3 py-1 rounded-lg text-sm font-medium'
      }, {
        type: 'month',
        count: 6,
        text: '6月',
        className: 'px-3 py-1 rounded-lg text-sm font-medium'
      }, {
        type: 'year',
        count: 1,
        text: '1年',
        className: 'px-3 py-1 rounded-lg text-sm font-medium'
      }, {
        type: 'all',
        text: '全部',
        className: 'px-3 py-1 rounded-lg text-sm font-medium'
      }],
      buttonTheme: {
        width: 60,
        height: 32,
        padding: 0,
        style: {
          color: '#6b7280',
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          backgroundColor: '#f3f4f6',
          border: 'none',
          borderRadius: '0.5rem',
          transition: 'all 0.2s ease'
        },
        states: {
          hover: {
            backgroundColor: '#e5e7eb',
            color: '#374151'
          },
          select: {
            backgroundColor: '#3b82f6',
            color: '#ffffff'
          }
        }
      },
      inputStyle: {
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        color: '#374151',
        fontSize: '0.875rem'
      },
      labelStyle: {
        color: '#6b7280',
        fontWeight: 500,
        fontSize: '0.875rem'
      }
    },
    navigator: {
      height: 40,
      xAxis: {
        gridLineColor: '#f3f4f6',
        labels: {
          style: {
            color: '#6b7280',
            fontSize: '0.75rem'
          }
        }
      },
      yAxis: {
        gridLineColor: '#f3f4f6',
        labels: {
          style: {
            color: '#6b7280',
            fontSize: '0.75rem'
          }
        }
      },
      maskFill: 'rgba(59, 130, 246, 0.1)',
      series: {
        color: '#3b82f6',
        lineWidth: 2
      }
    },
    scrollbar: {
      height: 12,
      barBackgroundColor: '#e5e7eb',
      barBorderRadius: 6,
      barBorderWidth: 0,
      buttonBackgroundColor: '#e5e7eb',
      buttonBorderWidth: 0,
      buttonBorderRadius: 6,
      buttonArrowColor: '#6b7280',
      buttonArrowSize: 12,
      trackBackgroundColor: '#f3f4f6',
      trackBorderWidth: 0,
      trackBorderRadius: 6
    },
    title: {
      text: `${symbol} K线图`,
      style: {
        color: '#111827',
        fontWeight: 700,
        fontSize: '1.25rem',
        lineHeight: '1.75rem',
        margin: '0 0 1rem 0'
      }
    },
    xAxis: {
      type: 'datetime',
      gridLineColor: '#f3f4f6',
      labels: {
        style: {
          color: '#6b7280',
          fontSize: '0.875rem'
        }
      },
      lineColor: '#e5e7eb',
      lineWidth: 1,
      tickColor: '#e5e7eb'
    },
    yAxis: [{
      labels: {
        align: 'right',
        x: -3,
        style: {
          color: '#6b7280',
          fontSize: '0.875rem'
        }
      },
      title: {
        text: '股价',
        style: {
          color: '#374151',
          fontWeight: 600,
          fontSize: '0.875rem'
        }
      },
      height: '70%',
      resize: {
        enabled: true
      },
      gridLineColor: '#f3f4f6',
      lineColor: '#e5e7eb',
      lineWidth: 1,
      tickColor: '#e5e7eb'
    }, {
      labels: {
        align: 'right',
        x: -3,
        style: {
          color: '#6b7280',
          fontSize: '0.875rem'
        }
      },
      title: {
        text: '成交量',
        style: {
          color: '#374151',
          fontWeight: 600,
          fontSize: '0.875rem'
        }
      },
      top: '75%',
      height: '25%',
      offset: 0,
      gridLineColor: '#f3f4f6',
      lineColor: '#e5e7eb',
      lineWidth: 1,
      tickColor: '#e5e7eb'
    }],
    tooltip: {
      split: false,
      shared: true,
      valueDecimals: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: '0.5rem',
      shadow: {
        color: 'rgba(0, 0, 0, 0.1)',
        width: 4,
        height: 4,
        offsetX: 0,
        offsetY: 2
      },
      style: {
        color: '#111827',
        fontSize: '0.875rem',
        lineHeight: '1.25rem'
      },
      formatter: function(this: any) {
        const date = new Date(this.points[0].x);
        const dateStr = date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        let tooltip = `<div style="padding: 0.75rem;">`;
        tooltip += `<div style="font-weight: 600; margin-bottom: 0.5rem; color: #111827;">${dateStr}</div>`;
        
        this.points.forEach((point: any) => {
          if (point.series.type === 'candlestick') {
            tooltip += `<div style="margin-bottom: 0.25rem;">`;
            tooltip += `<span style="color: ${point.series.color}; font-weight: 500;">${point.series.name}: </span>`;
            tooltip += `<span style="color: #111827;">开盘: ${point.point.open.toFixed(2)}, </span>`;
            tooltip += `<span style="color: #111827;">最高: ${point.point.high.toFixed(2)}, </span>`;
            tooltip += `<span style="color: #111827;">最低: ${point.point.low.toFixed(2)}, </span>`;
            tooltip += `<span style="color: #111827;">收盘: ${point.point.close.toFixed(2)}</span>`;
            tooltip += `</div>`;
          } else if (point.series.type === 'column') {
            tooltip += `<div style="margin-bottom: 0.25rem;">`;
            tooltip += `<span style="color: ${point.series.color}; font-weight: 500;">${point.series.name}: </span>`;
            tooltip += `<span style="color: #111827;">${point.y.toLocaleString()}</span>`;
            tooltip += `</div>`;
          }
        });
        
        tooltip += `</div>`;
        return tooltip;
      }
    },
    plotOptions: {
      candlestick: {
        animation: {
          duration: 1000
        },
        color: '#ef4444',
        upColor: '#10b981',
        lineColor: '#ef4444',
        upLineColor: '#10b981',
        lineWidth: 1,
        shadow: {
          color: 'rgba(0, 0, 0, 0.05)',
          width: 1,
          offsetX: 0,
          offsetY: 1
        }
      },
      column: {
        animation: {
          duration: 1000
        },
        color: '#3b82f6',
        borderRadius: 0,
        shadow: {
          color: 'rgba(0, 0, 0, 0.05)',
          width: 1,
          offsetX: 0,
          offsetY: 1
        }
      }
    },
    series: [{
      type: 'candlestick',
      name: '股价',
      data: data,
      tooltip: {
        valueDecimals: 2
      },
      upColor: '#10b981',
      upLineColor: '#10b981',
      downColor: '#ef4444',
      downLineColor: '#ef4444',
      dataGrouping: {
        enabled: false
      }
    }, {
      type: 'column',
      name: '成交量',
      data: data.map(d => [d[0], d[5]]),
      yAxis: 1,
      color: '#3b82f6',
      dataGrouping: {
        enabled: false
      }
    }],
    exporting: {
      buttons: {
        contextButton: {
          symbol: 'menu',
          symbolStroke: '#6b7280',
          symbolStrokeWidth: 1.5,
          symbolFill: '#f3f4f6',
          symbolSize: 18,
          align: 'right',
          buttonTheme: {
            fill: 'transparent',
            stroke: 'none',
            width: 40,
            height: 40,
            r: 4,
            style: {
              color: '#6b7280',
              fontSize: '1rem'
            },
            states: {
              hover: {
                fill: '#e5e7eb'
              },
              select: {
                fill: '#d1d5db'
              }
            }
          }
        }
      },
      enabled: true
    },
    legend: {
      enabled: true,
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: {
        color: '#6b7280',
        fontWeight: 500,
        fontSize: '0.875rem'
      },
      itemHoverStyle: {
        color: '#374151'
      },
      itemDistance: 10,
      padding: 10
    }
  };

  // 如果在服务器端渲染或 Highcharts 未加载，返回占位符
  if (!Highcharts || !HighchartsReact) {
    return (
      <div className="w-full h-96 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60">加载图表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="p-4">
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          constructorType={'stockChart'}
        />
      </div>
    </div>
  );
}

/**
 * 檢視模式列舉
 */
const enumViewMode = Object.freeze({
  list: 0,
  table: 1,
  card: 2,
});

class TravelFood {
  constructor() {
    this.pageObject = {
      _currentPage: 0, //目前頁碼
      _totalPage: 0, //總頁數
      _pageSize: 10, //每頁呈現的資料數
      _travelFood: [], //小吃資料,
      _viewMode: 0, //檢視模式,
      _countyData: {}, //行政區域與鄉鎮列表
    };
    this.init();
  }

  init() {
    this.domLoading = document.querySelector('#Loading');
    this.domPagination = document.querySelector('#Pagination');
    this.domViewMode = document.querySelector('#TfView');
    this.domCounty = document.querySelector('#TfCounty');
    this.domTownship = document.querySelector('#TfTownship');
    this.domTravelFoodBody = document.querySelector('#TfBody');
    this.domPageNumber = document.querySelector('#TfPageNumber');
    this.domTotalPageNumber = document.querySelector('#TfTotalPage');
    this.domMainCntr = document.querySelector('#TfMain');
    this.domStickyAd = document.querySelector('#StickyAd');
    this.callTravelFoodData();
  }

  /**
   * 取得檢視模式
   * @returns 檢視模式
   */
  get viewMode() {
    return this.pageObject._viewMode;
  }

  /**
   * 取得行政區域與鄉鎮
   * @returns 行政區域與鄉鎮
   */
  get countyData() {
    return this.pageObject._countyData;
  }

  /**
   * 取得總頁數
   * @returns 總頁數
   */
  get totalPage() {
    return this.pageObject._totalPage;
  }

  /**
   * 取得目前頁碼
   * @returns 目前的頁碼
   */
  get currentPage() {
    return this.pageObject._currentPage;
  }

  /**
   * 取得每頁的資料數
   * @returns 每頁的資料筆數
   */
  get pageSize() {
    return this.pageObject._pageSize;
  }

  /**
   * 取得已儲存的小吃資料
   * @returns 已儲存的小吃資料
   */
  get travelFoodData() {
    return this.pageObject._travelFood;
  }

  /**
   * 設定目前頁碼
   * @param {number} targetPage
   */
  set currentPage(targetPage) {
    this.pageObject._currentPage = targetPage;
  }

  /**
   * 設定總頁數
   * @param {number}} value
   */
  set totalPage(value) {
    this.pageObject._totalPage = value;
  }

  /**
   * 儲存的小吃資料
   * @param {object} value
   */
  set travelFood(value) {
    this.pageObject._travelFood = value;
  }

  /**
   * 設定檢視模式
   */
  set viewMode(value) {
    this.pageObject._viewMode = value;
  }

  /**
   * 儲存鄉鎮的資料
   * @param {object} value
   */
  set countyData(value) {
    this.pageObject._countyData = value;
  }

  /**
   * 變更檢視模式
   * @param {enumViewMode} viewMode 
   */
  changeViewMode(viewMode) {
    let vm = this;
    const domViewmode = vm.domViewMode;
    const domMainContainer = vm.domMainCntr;

    switch (viewMode) {
      case enumViewMode.list:
        domMainContainer.classList = 'tf tf--list';
        break;
      case enumViewMode.table:
        domMainContainer.classList = 'tf tf--table';
        break;
      case enumViewMode.card:
        domMainContainer.classList = 'tf tf--card';
        break;
      default:
        domMainContainer.classList = 'tf tf--list';
        break;
    }
    
    domViewmode.querySelector('.tf__mode--active').classList.remove('tf__mode--active');
    domViewmode.querySelectorAll('.tf__mode')[viewMode].classList.add('tf__mode--active');
    vm.viewMode = viewMode;

  }

  /**
   * 設定檢視模式點擊變更的事件
   */
  setViewModeChangeEvent() {
    let vm = this;
    const domViewmode = vm.domViewMode;
    domViewmode.addEventListener('click', (e) => {
      if (e.target.nodeName === 'INPUT') {
        let targetViewMode = parseInt(e.target.value, 10);
        if (!isNaN(targetViewMode)) {
          let currentViewMode = vm.viewMode;
          if (targetViewMode !== currentViewMode) {
            vm.changeViewMode(targetViewMode);
            vm.renderData();
          }
        }
      }
    })
  }

  /**
   * 顯示與設定目前頁碼
   * @param {number} targetPage 
   */
  renderPageNumber(targetPage) {
    let vm = this;
    vm.domPageNumber.textContent = targetPage;
    vm.currentPage = targetPage;
  }

  /**
   * 設定按下頁碼的事件
   */
  setPageItemEvent() {
    let vm = this;
    const domPagination = vm.domPagination;
    const domMainContainer = vm.domMainCntr;
    
    domPagination.addEventListener('click', (e) => {
      if (e.target.nodeName === 'LI') {
        let currentPage = vm.currentPage;
        let targetPage = parseInt(e.target.dataset.pageNumber, 10);
        if (targetPage && targetPage !== currentPage) {
          domPagination.querySelector('.js-tf__pageItem').classList.remove('js-tf__pageItem');
          e.target.classList.add('js-tf__pageItem');
          vm.renderPageNumber(targetPage);
          vm.renderData();
          domMainContainer.scrollIntoView();
        }
      }
    })
  }

  /**
   * 設定行政區域選單變更的事件
   */
  setCountyChangeEvent() {
    let vm = this;
    let domCountySelect = vm.domCounty;
    domCountySelect.addEventListener('change', (e) => {
      vm.renderPageNumber(1);
      vm.renderTownshipFilter();
      vm.setTownshipChangeEvent();
      vm.renderData();
    })
  }

  /**
   * 設定鄉鎮區選單變更的事件
   */
  setTownshipChangeEvent() {
    let vm = this;
    let domTownshipSelect = vm.domTownship;
    domTownshipSelect.addEventListener('change', (e) => {
      vm.renderPageNumber(1);
      vm.renderData();
    })
  }

  /**
   * 廣告置頂事件
   */
  setAdStickyEvent() {
    let vm = this;
    const mobileWidth = 414;
    const domStickyAd = vm.domStickyAd;
    const stickyOffset = vm.domStickyAd.offsetTop;
    const stickyAdWidth= domStickyAd.clientWidth;
    window.onscroll = function () {
      if (window.innerWidth > mobileWidth) {
        if (window.pageYOffset >= stickyOffset) {
          domStickyAd.classList.add('js-sticky');
          domStickyAd.style.width = stickyAdWidth + 'px';
        } else {
          domStickyAd.classList.remove('js-sticky');
        }
      };
    };

  }

  /**
   * 渲染行政區域選單項目
   */
  renderCountyFilter() {
    let vm = this;
    let domCountySelect = vm.domCounty;
    let countyData = vm.countyData;
    Object.keys(countyData).forEach(county => {
      let countyOption = document.createElement('option');
      countyOption.value = county;
      countyOption.text = county;
      domCountySelect.appendChild(countyOption);
    });
  }

  /**
   * 渲染鄉鎮區選單項目
   */
  renderTownshipFilter() {
    let vm = this;
    let domTownshipSelect = vm.domTownship;
    let countyData = vm.countyData;
    let currentCounty = vm.domCounty.value;
    domTownshipSelect.innerHTML = '<option value="none">請選擇鄉鎮區</option>';
    if (currentCounty != 'none') {
      countyData[currentCounty].forEach(town => {
        domTownshipSelect.innerHTML += `<option value="${town}">${town}</option>`
      })
    }
  }

  /**
   * 渲染頁碼
   * @param {number} showfoodDataLength 總頁數
   */
  renderPagination(showfoodDataLength) {
    let vm = this;
    let template = '';
    let currentPage = vm.currentPage;
    vm.totalPage = showfoodDataLength;

    for (let i = 1; i <= showfoodDataLength; i += 1) {
      if (i === currentPage) {
        template += `<li class="text-center tf__pageItem js-tf__pageItem" data-page-number="${i}">${i}</li>`;
      } else {
        template += `<li class="text-center tf__pageItem" data-page-number="${i}">${i}</li>`;
      }
    }

    vm.domTotalPageNumber.textContent = showfoodDataLength;
    vm.domPagination.innerHTML = template;
    vm.domPageItems = vm.domPagination.querySelectorAll('.tf__pageItem');

    vm.setPageItemEvent();
  }

  /**
   * 整理資料為二維陣列
   */
  sortData(travelFoodData) {
    let vm = this;
    let pageSize = vm.pageSize;
    let sortArr = [];
    travelFoodData.forEach((foodData, index) => {
      if (index === 0) {
        for (let i = 0, totalPage = Math.ceil(travelFoodData.length / pageSize); i < totalPage; i += 1) {
          sortArr.push([]);
        }
      }
      sortArr[parseInt(index / pageSize)].push(foodData);
    });
    return sortArr;
  };

  /**
   * 渲染卡片
   * @param {object} showFoodData 要呈現的資料
   * @param {numer} currentPage 目前頁數
   * @returns 目前頁面卡片的HTML
   */
  renderCard(showFoodData, currentPage) {
    let cardTemplate = `<div class="tf__card">`;

    showFoodData[currentPage].forEach((foodData) => {
      cardTemplate += `<div class="card">
              <figure class="card__head">
                <img class="card__image tf__image"
                  src = "${foodData.PicURL}"
                  width = "430"
                  height = "200"
                  alt = "${foodData.Name}" >
              </figure>
               <div class="card__body">
                 <div class="inner__tag">
                   <div class="tf__tag tf__tag-info" title="${foodData.City}"> ${foodData.City} </div>
                   <div class="tf__tag text-italic text-light" title=${foodData.Town} > ${foodData.Town} </div>
                 </div>
                 <h2 class="tf__tit"> 
                  ${foodData.Name}
                 </h2>
                 <div class="card__desc" title="${foodData.HostWords}">
                  ${foodData.HostWords}
                </div>
               </div>
            </div>`
    });

    cardTemplate += `</div>`;

    return cardTemplate;
  }

  /**
   * 渲染清單
   * @param {object} showFoodData 要呈現的資料
   * @param {numer} currentPage 目前頁數
   * @returns 目前頁面清單的HTML
   */
  renderList(showFoodData, currentPage) {
    let limitDescLength = 100;
    let listTemplate = `<ul class = "tf__list">`;

    showFoodData[currentPage].forEach((foodData, index) => {
      listTemplate += `<li class="tf__item">
          <div class="tf__head inner__tag">
            <div class="tf__tag tf__tag-info">${foodData.City}</div>
            <div class="tf__tag tf__tag-secondary tf__tag-resp">${foodData.Town}</div>
          </div>
          <div class="tf__mobile">
            <h2 class="tf__tit tf__tit--mobile"> ${
              foodData.Url ?
                `<a class="text-link" href="${foodData.Url}" target="_blank" title="${foodData.Name}">${foodData.Name}</a>` :
                foodData.Name
            } </h2>
          </div
          <div class="tf__body">
            <div class="tf__imgcntr">
              <figure class="inner__image">
                <img class="tf__image"
                  src="${foodData.PicURL}"
                  width = "240" 
                  height ="160"
                  alt="${foodData.Name}">
              </figure>
            </div>
            <div class="tf__content">
              <h2 class = "tf__tit" > ${
                foodData.Url ?
                  `<a class="text-link" href="${foodData.Url}" target="_blank" title="${foodData.Name}">${foodData.Name}</a>` 
                  :foodData.Name
              } </h2>
              <p class="tf__desc" title="${foodData.HostWords}">
                ${
                  foodData.HostWords.length > limitDescLength ?
                  foodData.HostWords.slice(0, limitDescLength) + '...'
                  : foodData.HostWords
                }
              </p>
            </div>
          </div>
        </li>`
    })
    listTemplate += `</ul>`
    return listTemplate;
  }

  /**
   * 渲染表格
   * @param {object} showFoodData 要呈現的資料
   * @param {number} currentPage 目前頁數
   * @returns 目前頁面Table的HTML
   */
  renderTable(showFoodData, currentPage) {
    let vm = this;
    let pageSize = vm.pageSize;

    let tableTemplate = `
    <table class="tf__table" >
       <thead class="tf__head" >
       <tr>
         <th class="tf__tbcol tf__tbcol--num" title="編號" scope="col"> 編號 </th> 
         <th class="tf__tbcol tf__tbcol--city" title="行政區域" scope="col"> 行政區域 </th> 
         <th class="tf__tbcol tf__tbcol--town" title="鄉鎮區" scope="col"> 鄉鎮區 </th> 
         <th class="tf__tbcol tf__tbcol--name" title="商家" scope="col"> 商家 </th> 
         <th class="tf__tbcol tf__tbcol--address" title="地址" scope="col"> 地址 </th> 
       </tr> 
       </thead> 
       <tbody class="tf__body">`;

    showFoodData[currentPage].forEach((foodData, index) => {
      let currentDataIndex = currentPage * pageSize + index + 1; //目前資料在總資料的index
      if (index % 2) {
        tableTemplate += `<tr class="tf__row">`;
      } else {
        tableTemplate += `<tr class="tf__row tf__row-even">`;
      }

      tableTemplate += `<td class="tf__td text-secondary" title="${currentDataIndex}" align="right" scope="row">${currentDataIndex}</td>
            <td class="tf__td" title="${foodData.City}">${foodData.City}</td>
            <td class="tf__td" title="${foodData.Town}">${foodData.Town}</td>
            <td class="tf__td" title="${foodData.Name}">
              ${foodData.Url
                  ? `<a class="text-link" href="${foodData.Url}" target="_blank" title="${foodData.Name}">${foodData.Name}</a>`
                  : foodData.Name}
            </td>
            <td class="tf__td" title="${foodData.Address}">
              ${foodData.Address}
            </td>
        </td>
      </tr>`;
    });
    tableTemplate += `</tbody></table>`;
    return tableTemplate;
  }

  renderData() {
    let vm = this;
    let template = '';
    let mode = vm.viewMode;
    let currentPage = vm.currentPage - 1;
    let filterData = vm.travelFoodData;

    //篩選
    if (vm.domCounty.value != 'none') {
      filterData = filterData.filter(item => item.City == vm.domCounty.value);
      if (vm.domTownship.value != 'none') {
        filterData = filterData.filter(item => item.Town == vm.domTownship.value)
      };
    }

    let showFoodData = vm.sortData(filterData);
    vm.renderPagination(showFoodData.length);

    switch (mode) {
      case enumViewMode.list:
        template = vm.renderList(showFoodData, currentPage);
        break;
      case enumViewMode.table:
        template = vm.renderTable(showFoodData, currentPage);
        break;
      case enumViewMode.card:
        template = vm.renderCard(showFoodData, currentPage);
        break;
      default:
        template = vm.renderList(showFoodData, currentPage);
        break;
    }
    vm.domTravelFoodBody.innerHTML = template;
  }

  /**
   * 整理行政區域
   * @param {object} 地方小吃的資料
   */
  formatCounty(foodData) {
    let vm = this;
    let countyData = {};
    foodData.forEach((item) => {
      if (!countyData[item.City]) {
        countyData[item.City] = [];
        countyData[item.City].push(item.Town);
      } else {
        if (countyData[item.City].indexOf(item.Town) < 0) {
          countyData[item.City].push(item.Town);
        }
      }
    })
    vm.countyData = countyData;
    vm.renderCountyFilter();
  }

  /**
   * 呼叫API取資料
   */
  callTravelFoodData() {
    let vm = this;
    vm.domLoading.classList.remove('js-hidden');
    fetch('https://data.coa.gov.tw/Service/OpenData/ODwsv/ODwsvTravelFood.aspx')
      .then((response) => response.json())
      .then((foodData) => {
        vm.travelFood = foodData;
        vm.formatCounty(foodData);
        vm.setCountyChangeEvent();
        vm.renderPageNumber(1); //取完資料設定第一頁
        vm.changeViewMode(enumViewMode.list); //預設模式為列表
        vm.setViewModeChangeEvent();
        vm.renderData();
        vm.setAdStickyEvent();
        vm.domPagination.classList.remove('js-hidden');
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        vm.domLoading.classList.add('js-hidden');
      });
  }
}

const travelFood = new TravelFood();
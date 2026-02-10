var degree = 1800;
var clicks = 0;
var spinning = false;

// Danh sách kết quả tương ứng với mỗi ô (8 ô, mỗi ô 45 độ)
var prizes = [
  {number: 1, name: 'Số 1'},
  {number: 2, name: 'Số 2'},
  {number: 3, name: 'Số 3'},
  {number: 4, name: 'Số 4'},
  {number: 5, name: 'Số 5'},
  {number: 6, name: 'Số 6'},
  {number: 7, name: 'Số 7'},
  {number: 8, name: 'Số 8'}
];

$(document).ready(function() {
  $('#spin').click(function() {
    if (spinning) return;
    spinning = true;
    $('#popup-overlay').removeClass('show');
    
    // Random chọn ô trước (0-7)
    var targetIndex = Math.floor(Math.random() * 8);
    
    clicks++;
    
    // Tính góc cần quay để kim chỉ vào trung tâm ô đã chọn
    // Ô 0 (số 1) ở góc 22.5° (trung tâm ở 45°)
    // Mỗi ô cách nhau 45°
    // Kim ở vị trí 0° (12 giờ)
    var targetDegree = 45 + (targetIndex * 45); // Trung tâm của mỗi ô
    
    // Thêm vòng quay (5 vòng = 1800°) + điều chỉnh để dừng đúng ô
    var totalDegree = (degree * clicks) + (360 - targetDegree);
    
    $('#wheel .sec').each(function() {
      var t = $(this);
      var noY = 0;
      
      var c = 0;
      var n = 700;
      var interval = setInterval(function () {
        c++;
        if (c === n) {
          clearInterval(interval);
        }
        
        var aoY = t.offset().top;
        $('#txt').html(aoY);
        
        if(aoY < 23.89) {
          $('#spin').addClass('spin');
          setTimeout(function () {
            $("#spin").removeClass('spin');
          }, 100);
        }
      }, 10);
      
      $('#inner-wheel').css({'transform' : 'rotate(' + totalDegree + 'deg)'});
      
      noY = t.offset().top;
    });
    
    // Hiển thị popup kết quả sau khi quay xong
    setTimeout(function() {
      var result = prizes[targetIndex];
      $('#popup .result-number').html('Số ' + result.number);
      $('#popup .result-icon').html(result.name);
      $('#popup-overlay').addClass('show');
      spinning = false;
    }, 6000);
  });
  
  // Đóng popup
  $('#close-popup, #popup-overlay').click(function(e) {
    if (e.target.id === 'close-popup' || e.target.id === 'popup-overlay') {
      $('#popup-overlay').removeClass('show');
    }
  });
});
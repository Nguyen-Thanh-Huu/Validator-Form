function Validator(options) {

  // lay ra element cha cua formMessage
  function getParentElement(element,selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector) ) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }
  // lấy element của form
  var formElement = document.querySelector(options.form);

  if (formElement) {
    // laoij bỏ hành động mặc định khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var isFromValid = true;
      // thuc hien lap qua cac rule va validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
         var isValid = Validate(inputElement, rule); 
         if(!isValid) {
             isFromValid = false;
         }
      });

      if(isFromValid) { 
          // submit voi javascript 
        if(typeof options.onSubmit === 'function') {
            var enableInput = formElement.querySelectorAll('[name]');
             var formValue = Array.from(enableInput).reduce(function (values,input) {
              values[input.name] = input.value;
               return  values;
             },{})
            options.onSubmit(formValue)
        }
        // submit voi hanh vi mac dinh 
        else {
            formElement.onsubmit();
        }
      } 
    };
  }

  // xu li form validated
  if (formElement) {
    var selectorRules = {};
    options.rules.forEach(function (rule) {
      var inputElement = formElement.querySelector(rule.selector);
      // lưu lại các rules vào trong selectorRules
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }
      // xử lí khi blur khỏi input
      if (inputElement) {
        inputElement.onblur = function () {
          //value : inputElement.value;
          // test func : rule.test
          Validate(inputElement, rule);
        };
      }
      // xử lí khi nhập vào input
      inputElement.oninput = function () {
        var errorElement =
        getParentElement(inputElement,options.formGroupSelector).querySelector(".form-message");
        errorElement.innerText = " ";
        getParentElement(inputElement,options.formGroupSelector).classList.remove("invalid");
      };
    });

    
  }

  // ham thuc hien validate
  function Validate(inputElement, rule) {
    var errorElement = getParentElement(inputElement,options.formGroupSelector).querySelector(
      options.errorSelector
    );
    var errorMessage;
    // lấy ra các rules của selector
    var rules = selectorRules[rule.selector];

    //lăp qua từng rules của selector và kiểm tra , nếu có lỗi dừng việc kiểm tra luôn
    for (var i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParentElement(inputElement,options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParentElement(inputElement,options.formGroupSelector).classList.remove("invalid");
    }

    return !errorMessage;   
  }
}

// dinh nghia cac quy tac
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : message || "Vui lòng nhập trường này .";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "Trường này phải là Email ";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${min} ký tự `;
    },
  };
};

Validator.isRePassword = function (selector, getConfirm, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirm()
        ? undefined
        : message || "Gía trị nhập vào không đúng";
    },
  };
};

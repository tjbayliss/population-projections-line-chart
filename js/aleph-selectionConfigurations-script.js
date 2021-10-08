console.log("aleph-futureForces-selectionConfigurations-script.js");

aleph.selectionListConfigurations = {
  line: {
 
    ethnicities: {
      id: "line-selectpicker-ethnicities",
      multiple: true,
      value: "ethnicities",
      title: "Ethnicity",
      "data-style": "btn-primary",
      "data-width": "fit",
      "data-actions-box": "true",
      "data-dropup-auto": "false",
      "data-header": "Select Ethnicities",
      "full-array": [1, 2, 3, 4, 5, 6],
      defaults: [1, 2, 3, 4, 5, 6],
      container: "aleph-line-selector-col-1",
      "data-selected-text-format": "static",
    },
    ageBands: {
      id: "line-selectpicker-ageBands",
      value: "ageBands",
      multiple: true,
      title: "Age Band",
      "data-style": "btn-primary",
      "data-width": "fit",
      "data-actions-box": "true",
      "data-dropup-auto": "false",
      "data-header": "Select Age Bands",
      "full-array": [1, 2, 3, 4, 5, 6, 7, 8, 9],
      defaults: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      container: "aleph-line-selector-col-2",
      "data-selected-text-format": "static",
    },
    genders: {
      id: "line-selectpicker-genders",
      value: "genders",
      multiple: true,
      title: "Gender",
      "data-style": "btn-primary",
      "data-width": "fit",
      "data-actions-box": "true",
      "data-dropup-auto": "false",
      "data-header": "Select Genders",
      "full-array": [1, 2],
      defaults: [1, 2],
      container: "aleph-line-selector-col-3",
      "data-selected-text-format": "static",
    },
    nationalities: {
      id: "line-selectpicker-nationalities",
      value: "nationalities",
      multiple: true,
      title: "Nationality",
      "data-style": "btn-primary",
      "data-width": "fit",
      "data-actions-box": "true",
      "data-dropup-auto": "false",
      "data-header": "Select Nationalities",
      "full-array": [1, 2],
      defaults: [1, 2],
      container: "aleph-line-selector-col-4",
      "data-selected-text-format": "static",
    },
    religions: {
      id: "line-selectpicker-religions",
      value: "religions",
      multiple: true,
      title: "Religion",
      "data-style": "btn-primary",
      "data-width": "fit",
      "data-actions-box": "true",
      "data-dropup-auto": "false",
      "data-header": "Select Religions",
      "full-array": [1, 2, 3, 4],
      defaults: [1, 2, 3, 4],
      container: "aleph-line-selector-col-5",
      "data-selected-text-format": "static",
    },
    health: {
      id: "line-selectpicker-health",
      value: "health",
      multiple: true,
      title: "Health Status",
      "data-style": "btn-primary",
      "data-width": "fit",
      "data-actions-box": "true",
      "data-dropup-auto": "false",
      "data-header": "Select Health Statuses",
      "full-array": [1, 2, 3, 4, 5, 6, 7],
      defaults: [1, 2, 3, 4, 5, 6, 7],
      container: "aleph-line-selector-col-6",
      "data-selected-text-format": "static",
    },
    qualifications: {
      id: "line-selectpicker-qualifications",
      value: "qualifications",
      multiple: true,
      title: "Qualification",
      "data-style": "btn-primary",
      "data-width": "fit",
      "data-actions-box": "true",
      "data-dropup-auto": "false",
      "data-header": "Select Qualifications",
      "full-array": [1, 2, 3, 4],
      defaults: [1, 2, 3, 4],
      container: "aleph-line-selector-col-7",
      "data-selected-text-format": "static",
    },
  },
  pyramid: {
    regions: {
      id: "pyramid-selectpicker-regions",
      multiple: true,
      value: "regions",
      title: "Region",
      "data-style": "btn-primary",
      /*     "data-width": "fit",
     "data-width": "50%", */
      "data-actions-box": "true",
      "data-dropup-auto": "false",
      "data-header": "Select Regions",
      "full-array": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      defaults: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      container: "aleph-pyramid-lists-container",
      "data-selected-text-format": "static",
    },
    ethnicities: {
      id: "pyramid-selectpicker-ethnicities",
      multiple: true,
      value: "ethnicities",
      title: "Ethnicity",
      "data-style": "btn-primary",
      /*  "data-width": "fit", */
      /*  "data-width": "50%", */
      "data-actions-box": "true",
      "data-dropup-auto": "false",
      "data-header": "Select Ethnicities",
      "full-array": [1, 2, 3, 4, 5, 6],
      defaults: [1, 2, 3, 4, 5, 6],
      container: "aleph-pyramid-lists-container",
      "data-selected-text-format": "static",
    },
  },
  dot: {
    sortOrder: {
      id: "dot-selectpicker-sortOrder",
      multiple: null,
      value: "sortOrder",
      title: "Sort Order",
      "data-style": "btn-primary",
      "data-width": "fit",
      "data-actions-box": "false",
      "data-dropup-auto": "false",
      "data-header": "Select Sort Order to Display By",
      "full-array": [],
      defaults: [1],
      container: "aleph-dot-selector-col-2",
      "data-selected-text-format": "static",
    },
  },
};
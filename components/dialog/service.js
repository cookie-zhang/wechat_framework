'use strict';
const app = getApp();
const _g = app.base;
const _c = app.config;

Component({
    properties: {
        showServiceDialog: {
            type: Boolean,
            value: false,
            observer(newVal, oldVal, changedPath) {
                const self = this;
                self.setData({
                    showServiceDialog: newVal
                });
            }
        },
    },
    data: {
        showServiceDialog: false
    },
    created() {

    },
    methods: {
        onHideTap() {
            this.setData({
                showServiceDialog: false
            })
        }
    }
})
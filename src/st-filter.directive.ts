import {Directive, Input, OnInit, OnDestroy, ElementRef} from '@angular/core';
import {SmartTable} from './smart-table.service';
import {filter} from 'smart-table-core';
import {fromEvent, Subscription} from 'rxjs/index';
import {FilterOperator, FilterType} from './common-types';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

@Directive({
    selector: '[stFilter]',
    exportAs: 'stFilter'
})
export class StFilterDirective<T> implements OnInit, OnDestroy {
    private _directive: any;
    private _inputSubscription: Subscription;

    constructor(private table: SmartTable<T>, private _el: ElementRef) {
    }

    @Input('stFilter') pointer: string;

    @Input('stFilterOperator') operator = FilterOperator.INCLUDES;

    @Input('stFilterType') type = FilterType.STRING;

    @Input('stDebounceTime') delay = 300;

    filter(value: string): void {
        return this._directive.filter(value);
    }

    ngOnInit() {
        this._directive = filter({
            pointer: this.pointer,
            table: this.table,
            operator: this.operator,
            type: this.type
        });

        this._inputSubscription = fromEvent(this._el.nativeElement, 'input')
            .pipe(
                map(($event: any) => (<HTMLInputElement>$event.target).value),
                debounceTime(this.delay),
                distinctUntilChanged(),
            )
            .subscribe(v => this.filter(v));

        const state = this._directive.state();

        if (Array.isArray(state[this.pointer])) {
            this._el.nativeElement.value = state[this.pointer][0].value;
        }
    }

    ngOnDestroy() {
        this._directive.off();
        this._inputSubscription.unsubscribe();
    }
}

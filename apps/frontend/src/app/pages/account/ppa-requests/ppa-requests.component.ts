import { Component } from '@angular/core';

@Component({
  selector: 'app-ppa-requests',
  imports: [],
  templateUrl: './ppa-requests.component.html',
})
export class PpaRequestsComponent {
  isPowerProducer = true;
  isHydrogenProducer = true;

  requestsReceivedPending = [];
  requestsReceived = [];

  requestsSentPending = [];
  requestsSent = [];
}

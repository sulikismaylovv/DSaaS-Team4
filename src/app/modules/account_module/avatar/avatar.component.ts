import {Component, EventEmitter, Input, Output} from '@angular/core'
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser'
import {AuthService} from "../../../core/services/auth.service";

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.css'],
})
export class AvatarComponent {
    uploading = false
    @Output() upload = new EventEmitter<string>()

    constructor(private readonly supabase: AuthService, private readonly dom: DomSanitizer) {
    }

    _avatarUrl: SafeResourceUrl | undefined

    @Input()
    set avatarUrl(url: string | null) {
        if (url) {
            this.downloadImage(url).then(r => {
            });
        }
    }

    async downloadImage(path: string) {
        try {
            const {data} = await this.supabase.downLoadImage(path)
            if (data instanceof Blob) {
                this._avatarUrl = this.dom.bypassSecurityTrustResourceUrl(URL.createObjectURL(data))
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error downloading image: ', error.message)
            }
        }
    }

    async uploadAvatar(event: any) {
        try {
            this.uploading = true
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${Math.random()}.${fileExt}`

            await this.supabase.uploadAvatar(filePath, file)
            this.upload.emit(filePath)
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message)
            }
        } finally {
            this.uploading = false
        }
    }


}
